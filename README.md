# Terminal Command Buttons

A VSCode extension that lets you click on terminal commands in your code to execute them.

## Setup
### Clone Repo
```bash
git clone git@github.com:dwalter/vscode_term_cmd_btns.git
cd vscode_term_cmd_btns
```

###First time
```bash
sudo apt install npm
npm install
```

### Every time
```bash
npm run compile;
sudo npm install vsce -g
yes | vsce package;
code --install-extension terminal-command-buttons-*.vsix;
```
- reload vscode window with: cmd+shift+p -> Developer: Reload Window

## Features

Adds clickable commands wrapped in `<terminal>` tags that execute in the VSCode terminal when clicked.

## Usage

Add commands to your code like this:
```python
"""
run with:
<terminal>python main.py --arg0 "zero"</terminal>
"""
