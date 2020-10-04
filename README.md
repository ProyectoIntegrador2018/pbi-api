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

| Name                          | Email             | Role                                                                               |
| ----------------------------  | ----------------- | ---------------------------------------------------------------------------------- |
| Patricia Magdalena González   | patygzz@tec.mx    | Directora en Dirección de Bienestar y Consejería ITESM Campus Mty.                 |
| Sandra Nohemí Ramos Hernández | snrh@tec.mx       | Especialista de bienestar en Dirección de Bienestar y Consejería ITESM Campus Mty. |
| Andrea Lizbeth Chávez Niño    | ann.chavez@tec.mx | Nutrióloga Dir. Bienestar y Consejeria                                             |


### Environment URLS


* **Production** - [https://inscripciones-pbi-api.herokuapp.com/](https://inscripciones-pbi-api.herokuapp.com/)


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

Version 3.0
| Name                        | Email                       | Role                           |
|-----------------------------|-----------------------------|--------------------------------|
| Juan Carlos De León Álvarez | juandleon27@gmail.com       | Product Owner Proxy            |
| José Cruz Flores Flores     | josecruzflores.fl@gmail.com | Administrador de Configuración |
| Ricardo Gerhard             | garzag.rick@gmail.com       | SCRUM Master                   |
| Luis Marcelo Flores Canales | luismarcelofc@gmail.com     | Administrador de Proyecto      |

### Technology Stack
| Technology      | Version      |
| --------------- | ------------ |
| bcrypt          | 5.0.0        |
| express         | 4.17.1       |
| moment-timezone | 0.5.31       |
| mongoose        | 5.10.7       |
| nodemailer      | 6.4.13       |

### Management tools

You should ask for access to this tools if you don't have it already:

* [Github repo](https://github.com/ProyectoIntegrador2018/pbi-api)

* [Heroku](https://inscripciones-pbi-api.herokuapp.com) (API)

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
1. Setup a .env file holding the environment variables used in config.js

2. Fire up a terminal and run:

```
npm run dev
```

That command will create an instance in localhost:3000 as default. You can change this value changing the "port" variable in index.js


### Stop the project

Use Ctrl + C keys.
