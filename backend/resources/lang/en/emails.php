<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Verify email Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used by the verification email send to users.
    |
    */
    'hi' => 'Hi',
    'link' => 'Link',
    'click' => 'Please click on the link below or copy it into the address bar of your browser to confirm your email address',
    'verify' => [
        'verify' => 'Verify',
        'thanks' => 'Thanks you for creating an account in OkFreelancers. Don\'t forget to complete your registration!',
        'button' => 'Confirm my email address',
    ],
    'passwordReset' => [
        'passwordReset' => 'Reset password',
        'request' => 'We have received your request to reset your account password.',
        'notRequested' => 'If you have not requested a password change, please ignore this email.',
        'expiration' => 'This request will expire in 60 minutes.',
    ],
    'delete' => [
        'user' => [
            'subject' => 'Your account has been deleted',
            'text' => 'We inform you that your account has been successfully deleted, you will receive your balance back to the following email address: :email',
            'admin_text' => 'We inform you that your account has been deleted by OkFreelancers, you will receive your balance back to the following email address: :email'
        ],
        'company' => [
            'subject' => 'Your company profile has been deleted',
            'text' => 'We inform you that your company profile has been successfully removed',
            'admin_text' => 'We inform you that your company profile has been removed by OkFreelancers'
        ],
        'freelancer' => [
            'subject' => 'One of your freelancer profiles has been removed',
            'text' => 'We inform you that one of your freelancer profiles has been successfully removed',
            'admin_text' => 'We inform you that one of your freelancer profiles has been removed by OkFreelancers'
        ],
        'company' => [
            'subject' => 'One of your company projects has been removed',
            'text' => 'We inform you that one of your company projects has been successfully removed',
            'freelancer_text' => 'We inform you that one of the projects in which you participate has been removed',
            'admin_text' => 'We inform you that one of your company projects has been removed by OkFreelancers'
        ]
    ],
    'ban'=> [
        'ban' => [
            'notification' => 'Ban notification',
            'comunicate' => 'We regret to inform you that',
            'account' => 'your account has been banned indefinitely',
            'company' => 'your company has been suspended indefinitely',
            'freelancer' => 'one of your freelancer profiles has been banned indefinitely',
            'freelancer' => 'one of your company projects has been banned indefinitely',
            'reason' => 'for the following reason:',
        ],
        'rehabilitate' => [
            'notification' => 'Notification of rehabilitation',
            'comunicate' => 'We inform you that',
            'account' => 'your account has been rehabilitated',
            'company' => 'your company has been rehabilitated',
            'freelancer' => 'one of your freelancer profiles has been rehabilitated',
            'freelancer' => 'one of your company projects has been rehabilitated',
        ],
    ],
    'transaction' => [
        'payment' => 'We have received your payment',
        'withdraw' => 'We have sent you your payment',
        'okfreelancers_payment' => 'OkFreelancers Payment',
        'to_paypal' => 'to PayPal',
        'amount_eur' => 'Amount in €',
        'pay' => 'Pay'
    ],
    'accepted_offer' => [
        'accepted' => [
            'notification' => 'Offer accepted',
            'comunication' => 'Your offer for the project ":project_title" has been accepted. You can take the project from'
        ],
        'taken' => [
            'notification' => 'Project taken',
            'comunication' => 'Freelancer titled as ":freelancer_title", has taken your project ":project_title", which means he has started his job'
        ],
        'link' => 'here'
    ]

];
