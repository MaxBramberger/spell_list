# Spell list app

## Goal

We want to make a static web app, that uses client side persistence with indexedDB.

### Design Goals

- The source code MUST not contain any spell data
- The app MUST support editing spells and creating new ones
- The app MUST enable JSON import and export of created spell lists
- The app MUST contain a character creation interface as to manage spell lists for multiple characters

## Collaboration

### Feature branches

A feature branch workflow is preferred. See [Feature Branch Workflow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

### Kanban

Please find a Kanban board here:
https://trello.com/b/w5t6xQAX/spell-list-app

## Deployment

The app is deployed [here](https://maxbramberger.github.io/spell_list/).  
Deployment happens via github-actions. The workflow triggers whenever a pull request on master is merged.

## React

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
