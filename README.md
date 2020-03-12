# Nombre del proyecto

Sistema de Inscripciones PBI (Sitio Web)

## Table of contents

* [Client Details](#client-details)
* [Environment URLS](#environment-urls)
* [Team members](#team-members)
* [Technology Stack](#technology-stack)
* [Management resources](#management-resources)
* [Setup the project](#setup-the-project)
* [Running the stack for development](#running-the-stack-for-development)
* [Stop the project](#stop-the-project)
* [Restoring the database](#restoring-the-database)
* [Debugging](#debugging)
* [Running specs](#running-specs)
* [Checking code for potential issues](#checking-code-for-potential-issues)


### Client Details

| Name                         | Email             | Role                                                                               |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| Patricia Magdalena González  | patygzz@tec.mx    | Directora en Dirección de Bienestar y Consejería ITESM Campus Mty.                 |
| Sandra Nohemí Ramos Hernández| snrh@tec.mx       | Especialista de bienestar en Dirección de Bienestar y Consejería ITESM Campus Mty. | 


### Environment URLS

* **Production** - [TBD](inscripcionespbitec.firebaseapp.com)
* **Development** - [TBD](TBD)

### Team members

Version 1.0
| Name                              | Email                   | Role                              |
| --------------------------------- | ----------------------- | --------------------------------- |
|Lizzie Marielle Guajardo Mozo      | lizziemgm97@gmail.com   | Desarrollador                     |
|Alejandro González Valles          | alex.glz.v@hotmail.com  | Desarrollador                     |
|David Rojas Ortíz                  | dav_rojas@hotmail.com   | Desarrollador                     |
|Jonathan Melesio Cárdenas García   | jonathancrd@outlook.com | Desarrollador                     |
|Lizzie Montserrat Cañamar Carrillo | lizziecanamar@gmail.com | Desarrollador                     |

Version 2.0
| Name                              | Email                   | Role                              |
| --------------------------------- | ----------------------- | --------------------------------- |
|Lizzie Marielle Guajardo Mozo      | lizziemgm97@gmail.com   | Producto Owner Proxy              |
|Alejandro González Valles          | alex.glz.v@hotmail.com  | Administrador de Configuración    |
|David Rojas Ortíz                  | dav_rojas@hotmail.com   | SCRUM Master                      |
|Lizzie Montserrat Cañamar Carrillo | lizziecanamar@gmail.com | Administrador de Proyecto         |

### Technology Stack
| Technology      | Version      |
| --------------- | ------------ |
| bcrypt          | 3.0.6        |
| express         | 4.17.1       |
| moment-timezone | 0.5.27       |
| mongoose        | 5.7.3        |
| nodemailer      | 6.3.1        |

### Management tools

You should ask for access to this tools if you don't have it already:

* [Github repo](https://github.com/ProyectoIntegrador2018/pbi-api)
* [Backlog]()
* [Heroku](https://inscripcionespbi-backend.herokuapp.com) (API)
* [Documentation](https://drive.google.com/drive/u/2/folders/1HxzSv_UqLsO1F6e_aaYM3d7Hoos28w91)

## Development

### Setup the project

In order to correctly set up [`pbi-api`](https://github.com/ProyectoIntegrador2018/pbi-api) you will need to follow
some steps:

1. Clone this repository into your local machine

```bash
$ git clone git@github.com:ProyectoIntegrador2018/pbi-api.git
```

2. Fire up a terminal and run to download the node modules required:

```bash
$ npm install
```

3. This back-end API works with this backend [`pbi-front`](https://github.com/ProyectoIntegrador2018/pbi-api)

### Running the stack for Development

1. Fire up a terminal and run: 

```
node index.js
```

That command will lift every service crowdfront needs, such as the `rails server`, `postgres`, and `redis`.


It may take a while before you see anything, you can follow the logs of the containers with:

```
$ docker-compose logs
```

Once you see an output like this:

```
web_1   | => Booting Puma
web_1   | => Rails 5.1.3 application starting in development on http://0.0.0.0:3000
web_1   | => Run `rails server -h` for more startup options
web_1   | => Ctrl-C to shutdown server
web_1   | Listening on 0.0.0.0:3000, CTRL+C to stop
```

This means the project is up and running.

### Stop the project

In order to stop crowdfront as a whole you can run:

```
% plis stop
```

This will stop every container, but if you need to stop one in particular, you can specify it like:

```
% plis stop web
```

`web` is the service name located on the `docker-compose.yml` file, there you can see the services name and stop each of them if you need to.

### Restoring the database

You probably won't be working with a blank database, so once you are able to run crowdfront you can restore the database, to do it, first stop all services:

```
% plis stop
```

Then just lift up the `db` service:

```
% plis start db
```

The next step is to login to the database container:

```
% docker exec -ti crowdfront_db_1 bash
```

This will open up a bash session in to the database container.

Up to this point we just need to download a database dump and copy under `crowdfront/backups/`, this directory is mounted on the container, so you will be able to restore it with:

```
root@a3f695b39869:/# bin/restoredb crowdfront_dev db/backups/<databaseDump>
```

If you want to see how this script works, you can find it under `bin/restoredb`

Once the script finishes its execution you can just exit the session from the container and lift the other services:

```
% plis start
```

### Debugging

We know you love to use `debugger`, and who doesn't, and with Docker is a bit tricky, but don't worry, we have you covered.

Just run this line at the terminal and you can start debugging like a pro:

```
% plis attach web
```

This will display the logs from the rails app, as well as give you access to stop the execution on the debugging point as you would expect.

**Take note that if you kill this process you will kill the web service, and you will probably need to lift it up again.**

### Running specs

To run specs, you can do:

```
$ plis run test rspec
```

Or for a specific file:

```
$ plis run test rspec spec/models/user_spec.rb
```

### Checking code for potential issues

To run specs, you can do:

```
$ plis run web reek
```

```
$ plis run web rubocop
```

```
$ plis run web scss_lint
```

Or any other linter you have.
