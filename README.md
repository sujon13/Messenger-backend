This is the backend of my chat application. 

You will frontend [here](https://github.com/sujon13/Messenger).


 ### Cloning and Running the Application in local ###

-   First you need to have nodejs and npm installed on your pc.
    You can see it [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

-   Clone the repo in your terminal by clicking the green clone or download button at the top right and copying the url
-   Type `git clone [repository url]`
-   Type `cd [local repository]` to go to local repository.
-   Delete the node_modules folder and any 'lock' files such as package-lock.js.
-   Type `npm install` for installing all dependency
-   Type `npm start` to run the projects

The Application Runs on **localhost:4000**

**NB**: You need to create a .env file in project root directory and create below environment variables below run the project :-

 - `DB_CONNECTION=mongodb+srv://<user>:<password>@cluster0.58mik.mongodb.net/<database name>`
 - `PORT=4000`
 - `TOKEN_SECRET=<random string>`