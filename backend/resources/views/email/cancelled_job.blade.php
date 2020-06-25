<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <title>OkFreelancers | @lang('miscellaneous.cancelled_job')</title>
        <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head>

    <body style="width: 100%">
        <img src="http://iestrassierra.net/alumnado/curso1920/DAW/daw1920a2/okfreelancers/assets/images/logo_dark.png" style="display: block; width: 300px;">
        <div style="font-family: 'Open Sans', sans-serif;">
            <h1 style="background-color: #00b5d7; color: #ececec; padding: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; margin: 0;">@lang('emails.hi') {{ $name }}</h1>
            <div style="background-color: #ececec; color: #1a1a1a; padding: 5px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                <h3>
                    @if($by == 'company')
                        @if($receiver == 'company')
                            @lang('miscellaneous.job_canceled_by_company_description_company', [
                               'project_title' => $project->title,
                               'freelancer_title' => $freelancer->title,
                               'penalty' => $penalty,
                               'refound' => $refound
                           ])
                        @else
                            @lang('miscellaneous.job_canceled_by_company_description_freelancer', [
                               'company' => $company->name,
                               'project_title' => $project->title,
                               'freelancer_title' => $freelancer->title,
                               'penalty' => $penalty,
                               'refound' => $refound
                           ])
                        @endif
                    @else
                        @if($receiver == 'company')
                            @lang('miscellaneous.job_canceled_by_freelancer_description_company', [
                               'project_title' => $project->title,
                               'freelancer_title' => $freelancer->title,
                               'penalty' => $penalty,
                               'refound' => $refound
                           ])
                        @else
                            @lang('miscellaneous.job_canceled_by_freelancer_description_freelancer', [
                               'project_title' => $project->title,
                               'freelancer_title' => $freelancer->title,
                               'penalty' => $penalty
                           ])
                        @endif
                    @endif
                </h3>
            </div>
        </div>
    </body>
</html>
