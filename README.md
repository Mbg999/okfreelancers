# OkFreelancers
Este es el proyecto final que presenté en mi grado de DAW en 2020, y que me dió para un 10 😀

Consiste en una aplicación que sirve como nexo entre empresas y freelancers, de forma que las empresas pueden crear proyectos, y los freelancers pueden ofertarse en proyectos de su categoría.

La empresa tiene la posibilidad de ver las ofertas de su proyecto y aceptar las que más les guste, posteriormente el freelancer puede tomar la oferta aceptada y trabajar en ella.

Posteriormente, la empresa puede marcar el trabajo del freelancer como finalizado y dejarle una valoración.

El proyecto sigue una arquitectura API REST, con Laravel 7 como backend y Angular 9 como frontend, además de ngBootstrap como framework de diseño web.
El servidor HTTP y BDD, son los proporcionados por mi centro, el IES Trassierra

Cosas que contiene el proyecto:
<ul>
  <li>Multilenguaje, en español e inglés</li>
  <li>Pagos, tanto con PayPal como con Stripe.</li>
  <li>Generación de PDFS</li>
  <li>Un chat con websockets</li>
  <li>El dinero del usuario se actualiza con websockets para mostrar siempre el saldo 100% real</li>
  <li>Envío de emails</li>
  <li>Un cropper para que el usuario suba sus imagenes tratadas a su gusto</li>
  <li>Uso de archivos multimedia (audio, vídeo)</li>
</ul>

<p>Dejo por aquí la documentación oficial de tecnologías utilizadas que presenté: https://drive.google.com/file/d/1rAcEsqmsAsZk4ItVnXBzxtM1-mOyOsIl/view?usp=sharing</p>
<p>Y por aquí la documentación de la BDD también presentada: https://drive.google.com/file/d/1R6JRT6tLZttLeu4rl1MkqMR0IVaVbjSP/view?usp=sharing</p>
<p>La documentación de postman para las rutas de la API: https://documenter.getpostman.com/view/4552748/Szf53Us1?version=latest</p>

Puedes visitar la aplicación en el servidor del IES Trassierra: http://www.iestrassierra.net/alumnado/curso1920/DAW/daw1920a2/okfreelancers/

<hr>

He de añadir que los websockets necesitan de un demonio llamado "supervisor" para mantenerlos activos, cosa que no he podido implementar ya que no he tenido acceso más allá de mi virtual host, por lo que para el uso de los websockets los tengo que activar a mano y puede ser que alguna vez no funcione porque el servidor mate el proceso, en ese caso, contáctame y los volveré a activar :D


