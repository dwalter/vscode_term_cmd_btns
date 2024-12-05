// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "terminal-command-buttons" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('terminal-command-buttons.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from Terminal Command Buttons!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}

// <terminal> ls -l </terminal>

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Register a custom language for terminal commands
    const provider = vscode.languages.registerDocumentSemanticTokensProvider(
        { language: '*' },
        new TerminalCommandProvider(),
        legend
    );

    // Command to execute terminal command
    let disposable = vscode.commands.registerCommand('extension.executeTerminalCommand', (command: string) => {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        terminal.sendText(command);
    });

    // Register a content provider for our custom URI scheme
    const commandLinkProvider = vscode.languages.registerDocumentLinkProvider(
        { language: '*' },
        new TerminalCommandLinkProvider()
    );

    context.subscriptions.push(provider, disposable, commandLinkProvider);
}

class TerminalCommandProvider implements vscode.DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(
        document: vscode.TextDocument
    ): Promise<vscode.SemanticTokens> {
        const builder = new vscode.SemanticTokensBuilder();

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const terminalCommandMatch = line.text.match(/<terminal>(.*?)<\/terminal>/);

            if (terminalCommandMatch) {
                const startIndex = line.text.indexOf('<terminal>');
                builder.push(
                    i,
                    startIndex,
                    terminalCommandMatch[0].length,
                    0,  // token type (command)
                    0   // token modifier
                );
            }
        }

        return builder.build();
    }
}

class TerminalCommandLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const terminalCommandMatch = line.text.match(/<terminal>(.*?)<\/terminal>/);

            if (terminalCommandMatch) {
                const startIndex = line.text.indexOf('<terminal>');
                const range = new vscode.Range(
                    new vscode.Position(i, startIndex),
                    new vscode.Position(i, startIndex + terminalCommandMatch[0].length)
                );

                const commandUri = vscode.Uri.parse(
                    `command:extension.executeTerminalCommand?${encodeURIComponent(
                        JSON.stringify(terminalCommandMatch[1].trim())
                    )}`
                );

                links.push(new vscode.DocumentLink(range, commandUri));
            }
        }

        return links;
    }
}

const legend = new vscode.SemanticTokensLegend(
    ['command'],
    []
);

export function deactivate() {}
