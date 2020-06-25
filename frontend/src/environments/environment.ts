// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url: 'http://192.168.0.78/okfreelancers',
  frontUrl: 'http://192.168.0.78:4200',
  wsHost: '192.168.0.78',
  pusher: {
    key: '8d9d602616560a230506',
    cluster: 'eu'
  }
  // url: 'http://www.iestrassierra.net/alumnado/curso1920/DAW/daw1920a2/okfreelancers_backend'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
