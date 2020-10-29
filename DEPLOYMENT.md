# PBI API: Deployment

In this document we use heroku in order to deploy the project. Other platforms can be used.
MongoDB Atlas is used as the production backend

## Table of contents

* [Preconditions](#Preconditions)
* [Technology Stack](#technology-stack)
* [Clone or update repository](#Clone-or-update-repository)
* [Deploying to Heroku](#Deploying-to-Heroku)

### Technology Stack
| Technology      | Version      |
| --------------- | ------------ |
| bcrypt          | 5.0.0        |
| express         | 4.17.1       |
| moment-timezone | 0.5.31       |
| mongoose        | 5.10.7       |
| nodemailer      | 6.4.13       |
| nodejs          | 12.14.0      |



### Preconditions
Having the following tools installed and configured:
- Git ([Instrucciones](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
- Heroku CLI ([Instrucciones](https://devcenter.heroku.com/articles/heroku-cli#download-and-install))

### Clone or update repository
If you don't have a copy of the repository, you will have to clone it first:
```bash
$ git clone git@github.com:ProyectoIntegrador2018/pbi-api.git
```

Run the following command:
```bash
$ git status
```

If done correctly you will get the next message:
```
On branch master
Your branch is up-to-date with 'origin/master'.
```

If not, make sure your working directory is clean and that the local branch is up to date:
```bash
$ git pull origin master
```

### Deploying to Heroku

If not, login into heroku usging the next comand
```bash
$ heroku login
```

Run the following command to setup the Heroku environment:
```bash
$ heroku create
```

After you commit your changes to git, you can deploy your app to Heroku:
```bash
$ git push heroku master
```
The back-end of this project will be working now.

In the Heroku online admin panel, Environment variables for the Mongo URL must be added
