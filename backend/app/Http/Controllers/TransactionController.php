<?php

namespace App\Http\Controllers;

use App\Events\NewBalance;
use App\Transaction;
use App\User;
use Barryvdh\DomPDF\Facade as PDF;
use Symfony\Component\HttpFoundation\Response;
use \PayPal\Api\Payout;
use \PayPal\Api\PayoutSenderBatchHeader;
use \PayPal\Api\PayoutItem;
use \PayPal\Api\Currency;
use \PayPal\Rest\ApiContext;
use \PayPal\Auth\OAuthTokenCredential;

class TransactionController extends Controller {

    public function getMyTransactions(){
        $transactions = auth()->user()->transactions()->orderBy('id', 'desc')->get();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.correctly_paid'),
            'data' => $transactions
        ], Response::HTTP_OK);
    }

    public function getTransactionsAsAdmin($id){
        $transactions = User::withTrashed()->findOrFail($id)->transactions()->orderBy('id', 'desc')->get();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.correctly_paid'),
            'data' => $transactions
        ], Response::HTTP_OK);
    }

    /**
     * Creates the stripe_id client if the auth user doesn't have one,
     * sets a default payment method,
     * charges the amount to the default payment method of the auth user
     *
     * sets the new balance to the user
     *
     * ATTENTION: stripe reads the amount like 1€ = 100 cents, so its needed to parse euros to cents
     *
     * @return JSON response
     */
    public function addBalanceWithStripe(){
        auth()->user()->createOrGetStripeCustomer([
            'email'=> auth()->user()->email,
            'source' => request()->get('stripeToken')['id']
        ]);

        auth()->user()->updateDefaultPaymentMethod(request()->get('paymentMethod')['id']); // save as last card used (i can have a table for available payment methods)

        auth()->user()->charge(floatval(request()->get('amount')) * 100, auth()->user()->defaultPaymentMethod()->id,[
            'description' => trans('miscellaneous.user_balance')
        ]);

        $transaction = Transaction::find(Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => floatval(request()->get('amount')),
            'pay' => request()->get('stripeToken')['card']['brand'],
            'description' => trans('miscellaneous.user_balance')
        ])->id);

        auth()->user()->update(['balance' => auth()->user()->balance + floatval(request()->get('amount'))]);
        event(new NewBalance(auth()->user()));
        auth()->user()->sendTransactionNotification('payment', $transaction->amount, $transaction->from, $transaction->description, trans('miscellaneous.thanks_trusting'));

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.correctly_paid'),
            'data' => $transaction
        ], Response::HTTP_OK);
    }

    public function addBalanceWithPaypal(){
        $transaction = Transaction::find(Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => floatval(request()->get('amount')),
            'pay' => 'PayPal',
            'description' => request()->get('description')
        ])->id);

        auth()->user()->update(['balance' => auth()->user()->balance + floatval(request()->get('amount'))]);
        event(new NewBalance(auth()->user()));
        auth()->user()->sendTransactionNotification('payment', $transaction->amount, $transaction->from, $transaction->description, trans('miscellaneous.thanks_trusting'));

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.correctly_paid'),
            'data' => $transaction
        ], Response::HTTP_OK);
    }

    public function withdrawBalanceWithPaypalAsAuth(){
        return self::withdrawBalanceWithPaypal(
            auth()->user(),
            floatval(request()->get('amount')),
            request()->get('email'),
            trans('miscellaneous.thanks_trusting')
        );
    }

    public static function withdrawBalanceWithPaypal($user, $amount, $email, $note){
        if($user->balance < $amount){
            return response()->json([
                'ok' => false,
                'errors' => ['amount' => trans('validation.not_enough_balance')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $paypalConf = self::initializePaypalConfig();

        $payouts = new Payout();
        $senderBatchHeader = new PayoutSenderBatchHeader();
        $senderBatchHeader->setSenderBatchId(uniqid())
            ->setEmailSubject(trans('emails.transaction.okfreelancers_payment'));
        $senderItem = new PayoutItem();
        $senderItem->setRecipientType('Email')
            ->setNote($note)
            ->setReceiver($email)
            //->setSenderItemId("2014031400023")
            ->setAmount(new Currency('{
                        "value":"'.$amount.'",
                        "currency":"EUR"
                    }'));

        $payouts->setSenderBatchHeader($senderBatchHeader)
            ->addItem($senderItem);

        // ### Create Payout
        try {
            $payouts->create([$paypalConf['paypalConf']], $paypalConf['apiContext']);

            // SET NEW BALANCE + TRANSACTION + NOTIFICATION EMAIL
            $transaction = Transaction::find(Transaction::create([
                'user_id' => $user->id,
                'amount' => $amount*-1,
                'pay' => trans('emails.transaction.okfreelancers_payment').' '.trans('emails.transaction.to_paypal'),
                'description' => trans('miscellaneous.user_withdraw', ['account'=>$email])
            ])->id);

            $user->update(['balance' => $user->balance - $amount]);
            event(new NewBalance(auth()->user()));
            $user->sendTransactionNotification('withdraw', $transaction->amount, $transaction->from, $transaction->description, $note);

        } catch (Exception $ex) {
            return response()->json([
                'ok' => false,
                'errors' => $ex
            ], Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.correctly_withdrawn'),
            'data' => $transaction
        ], Response::HTTP_OK);
    }

    private static function initializePaypalConfig(){
        /** PayPal api context **/
        $paypalConf = \Config::get('paypal');
        $apiContext = new ApiContext(new OAuthTokenCredential(
                $paypalConf['client_id'],
                $paypalConf['secret'])
        );
        $apiContext->setConfig($paypalConf['settings']);
        return ['paypalConf' => $paypalConf, 'apiContext' => $apiContext];
    }

    public function generatePDF(){
        $pdf = PDF::loadView('pdf.transactions', ['transactions' => auth()->user()->transactions()->orderBy('created_at','desc')->get()]);
        return $pdf->stream();
    }
}
