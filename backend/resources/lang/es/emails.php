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

    'hi' => 'Hola',
    'link' => 'Enlace',
    'click' => 'Haga clic en el enlace a continuación o cópielo en la barra de direcciones de su navegador para confirmar su dirección de correo electrónico.',
    'verify' => [
        'verify' => 'Verificar',
        'thanks' => 'Gracias por crear una cuenta en OkFreelancers, ¡no olvides completar tu registro!',
        'button' => 'Confirmar mi dirección de correo electrónico',
    ],
    'passwordReset' => [
        'passwordReset' => 'Reestablecer contraseña',
        'request' => 'Hemos recibido tu petición para restablecer la contraseña de tu cuenta',
        'notRequested' => 'Si usted no ha solicitado un cambio de contraseña, ignore este correo.',
        'expiration' => 'Esta solicitud caducará en 60 minutos.',
    ],
    'delete' => [
        'user' => [
            'subject' => 'Tu cuenta ha sido eliminada',
            'text' => 'Te comunicamos que tu cuenta ha sido eliminada satisfactoriamente, recibirás tu saldo de vuelta a la siguiente dirección de correo electrónico: :email',
            'admin_text' => 'Te comunicamos que tu cuenta ha sido eliminada por OkFreelancers, recibirás tu saldo de vuelta a la siguiente dirección de correo electrónico: :email'
        ],
        'company' => [
            'subject' => 'Tu perfil de empresa ha sido eliminado',
            'text' => 'Te comunicamos que tu perfil de empresa ha sido eliminado satisfactoriamente',
            'admin_text' => 'Te comunicamos que tu perfil de empresa ha sido eliminado por OkFreelancers'
        ],
        'freelancer' => [
            'subject' => 'Uno de tus perfiles freelancer ha sido eliminado',
            'text' => 'Te comunicamos que uno de tus perfiles freelancer ha sido eliminada satisfactoriamente',
            'admin_text' => 'Te comunicamos que uno de tus perfiles freelancer ha sido eliminada por OkFreelancers'
        ],
        'project' => [
            'subject' => 'Uno de los proyectos de tu empresa ha sido eliminado',
            'text' => 'Te comunicamos que uno de los proyectos de tu empresa ha sido eliminado satisfactoriamente',
            'freelancer_text' => 'Te comunicamos que uno de los proyectos en los que participas ha sido eliminado',
            'admin_text' => 'Te comunicamos que uno de los proyectos de tu empresa ha sido eliminado por OkFreelancers'
        ]
    ],
    'ban'=> [
        'ban' => [
            'notification' => 'Notificación de suspensión',
            'comunicate' => 'Lamentamos comunicarle que',
            'account' => 'su cuenta ha sido suspendida indefinidamente',
            'company' => 'su empresa ha sido suspendida indefinidamente',
            'freelancer' => 'uno de sus perfiles freelancer ha sido suspendido indefinidamente',
            'project' => 'uno de los proyectos de su empresa ha sido suspendido indefinidamente',
            'reason' => 'por la siguiente razón:',
        ],
        'rehabilitate' => [
            'notification' => 'Notificación de rehabilitación',
            'comunicate' => 'Le comunicamos que',
            'account' => 'su cuenta ha sido rehabilitada',
            'company' => 'su empresa ha sido rehabilitada',
            'freelancer' => 'uno de sus perfiles freelancer ha sido rehabilitado',
            'project' => 'uno de los proyectos de su empresa ha sido rehabilitado'
        ],
    ],
    'transaction' => [
        'payment' => 'Hemos recibido tu pago',
        'withdraw' => 'Te hemos enviado tu pago',
        'okfreelancers_payment' => 'Pago de OkFreelancers',
        'to_paypal' => 'a PayPal',
        'amount_eur' => 'Cantidad en €',
        'pay' => 'Pago'
    ],
    'accepted_offer' => [
        'accepted' => [
            'notification' => 'Oferta aceptada',
            'comunication' => 'Tu oferta para el proyecto ":project_title" ha sido aceptada. Podrás tomar el proyecto desde'
        ],
        'taken' => [
            'notification' => 'Proyecto tomado',
            'comunication' => 'El freelancer titulado como ":freelancer_title", ha tomado tu proyecto ":project_title", lo que significa que ha empezado su trabajo'
        ],
        'link' => 'aquí'
    ]


];
