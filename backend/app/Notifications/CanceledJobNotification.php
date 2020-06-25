<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CanceledJobNotification extends Notification
{
    use Queueable;

    public $name;
    public $by; // "freelancer" or "company"
    public $receiver; // "freelancer" or "company"
    public $project;
    public $freelancer;
    public $refound;
    public $penalty;
    public $company;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($name, $by, $receiver, $project, $freelancer, $refound, $penalty, $company=null) {
        $this->name = $name;
        $this->by = $by;
        $this->receiver = $receiver;
        $this->project = $project;
        $this->freelancer = $freelancer;
        $this->refound = $refound;
        $this->penalty = $penalty;
        $this->company = $company;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject(trans('miscellaneous.job_canceled'))
            ->view('email.cancelled_job',[
                'name' => $this->name,
                'by' => $this->by,
                'receiver' => $this->receiver,
                'project' => $this->project,
                'freelancer' => $this->freelancer,
                'refound' => $this->refound,
                'penalty' => $this->penalty,
                'company' => $this->company,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
