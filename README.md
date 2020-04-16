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
1. Create a file called config.js in the root folder.

2. Create a variable called conecction URL that contains the URL to access a MongoDB database and export it:
```
module.exports.connectionURL = <Your collection URL>
```
3. In the same file create a variable called secret, this will be the secret to encrypt passwords and create tokens, so be sure to take the necessary cautions:

```
module.exports.secret = <Your secret>
```

4. Fire up a terminal and run: 

```
node index.js
```

That command will create an instance in localhost:3000 as default. You can change this value changing the "port" variable in index.js


### Stop the project

Use Ctrl + C keys.
