#! /usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const names = require('all-the-package-names');

const { prompt } = inquirer;
const { readdirSync, mkdirSync, statSync, readFileSync, writeFileSync } = fs;

const CHOICES = readdirSync(`${__dirname}/templates`);
const CURR_DIR = process.cwd();

const QUESTIONS = [
    {
        name: 'main',
        type: 'list',
        message: 'What do you want to do?',
        choices: [
          'libs: I want to check our Revolt libraries',
          'boilerplate: I want to start a new project from boilerplate'
        ]
    }
];

const QUESTIONS_NEW_PROJECT = [
    {
        name: 'project-choice',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES
    },
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate: function(input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) {
                return true;
            } else {
                return 'Project name may only include letters, numbers, underscores and hashes.';
            }
        }
    }
];

prompt(QUESTIONS).then(answers => {
    switch (answers.main.split(':')[0]) {
        case 'libs':
            listRevoltPackages();
        break;
        case 'boilerplate':
            prompt(QUESTIONS_NEW_PROJECT).then(answers => {
                const projectChoice = answers['project-choice'];
                const projectName = answers['project-name'];
                const templatePath = `${__dirname}/templates/${projectChoice}`;

                mkdirSync(`${CURR_DIR}/${projectName}`);

                createDirectoryContents(templatePath, projectName);
            });
        break;
        default:
            console.log(':/');
    }
});

function listRevoltPackages() {
    const list = names.filter(name => name.includes('revolt-digital'));
    console.table(list);
}

function createDirectoryContents(templatePath, newProjectPath) {
    const filesToCreate = readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;

        // get stats about the current file
        const stats = statSync(origFilePath);

        if (stats.isFile()) {
            const contents = readFileSync(origFilePath, 'utf8');
            // rename fallback for npm ignore.

            if (file === '.npmignore') {
                file = '.gitignore';
            }

            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

            // recursive call
            createDirectoryContents(
              `${templatePath}/${file}`,
              `${newProjectPath}/${file}`
            );
        }
    });
}
