/*
first time:
<terminal> npm install </terminal>

every time:
<terminal>
npm run compile;
yes | vsce package;
code --install-extension terminal-command-buttons-*.vsix;
</terminal>
then there will be a .vsix file created

reload window with: cmd+shift+p -> Developer: Reload Window

manually install with vscode (instead of code --install-extension terminal-command-buttons-*.vsix;):
- Ctrl+Shift+P
- Type "Install from VSIX"
- Select the .vsix file you created
- Restart VSCode
*/

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const decorator = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '▶',
            margin: '0 4px 0 0',
            color: '#4CAF50'
        },
        backgroundColor: '#e7e7e7',
        border: '1px solid #ccc',
        borderRadius: '3px',
        cursor: 'pointer',
        light: {
            backgroundColor: '#e7e7e7'
        },
        dark: {
            backgroundColor: '#3a3a3a'
        }
    });

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        updateDecorations(activeEditor, decorator);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            updateDecorations(editor, decorator);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            updateDecorations(activeEditor, decorator);
        }
    }, null, context.subscriptions);

    let disposable = vscode.commands.registerCommand('extension.executeTerminalCommand', (command: string) => {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        // Split by newlines and semicolons, filter empty lines, and execute each command
        const commands = command
            .split(/[;\n]/)
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        commands.forEach((cmd, index) => {
            // Add a small delay between commands to ensure proper order
            setTimeout(() => {
                terminal.sendText(cmd);
            }, index * 100);
        });
    });

    const commandLinkProvider = vscode.languages.registerDocumentLinkProvider(
        { language: '*' },
        new TerminalCommandLinkProvider()
    );

    context.subscriptions.push(disposable, commandLinkProvider);
}

function updateDecorations(editor: vscode.TextEditor, decorator: vscode.TextEditorDecorationType) {
    // Updated regex to handle multi-line content
    const regEx = /<terminal>\s*([\s\S]*?)\s*<\/terminal>/g;
    const text = editor.document.getText();
    const decorations: vscode.DecorationOptions[] = [];

    let match;
    while ((match = regEx.exec(text))) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);

        // Format the hover message to show commands on separate lines
        const commands = match[1]
            .split(/[;\n]/)
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);
        const hoverMessage = 'Commands to run:\n' + commands.map(cmd => '• ' + cmd).join('\n');

        const decoration: vscode.DecorationOptions = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage
        };

        decorations.push(decoration);
    }

    editor.setDecorations(decorator, decorations);
}

class TerminalCommandLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];
        const regEx = /<terminal>\s*([\s\S]*?)\s*<\/terminal>/g;
        const text = document.getText();

        let match;
        while ((match = regEx.exec(text))) {
            const startIndex = match.index;
            const range = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(startIndex + match[0].length)
            );

            const commandUri = vscode.Uri.parse(
                `command:extension.executeTerminalCommand?${encodeURIComponent(
                    JSON.stringify(match[1].trim())
                )}`
            );

            links.push(new vscode.DocumentLink(range, commandUri));
        }

        return links;
    }
}

export function deactivate() {}
