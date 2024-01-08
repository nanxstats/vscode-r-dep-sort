import * as vscode from 'vscode';

import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

function readFile(filePath: string): string {
	return readFileSync(filePath, 'utf8');
}

function writeFile(filePath: string, content: string): void {
	writeFileSync(filePath, content, 'utf8');
}

function formatFieldContent(fieldContent: string): string[] {
	return fieldContent
		.replace(/\s+/g, ' ') // Replace all whitespace with single spaces
		.split(',')
		.map(pkg => pkg.trim())
		.filter(pkg => pkg !== '')
		.sort();
}

function formatDescriptionContent(content: string, fields: string[]): string {
	fields.forEach(field => {
		const fieldRegex = new RegExp(`${field}:\\s*([^\\n]+(?:\\n\\s{4,}[^\\n]+)*)`, 'g');
		content = content.replace(
			fieldRegex,
			(match: string, fieldContent: string) => {
				const formattedPackages = formatFieldContent(fieldContent)
					.map((pkg: string, index: number, arr: string[]) => '    ' + pkg + (index < arr.length - 1 ? ',' : ''))
					.join('\n');

				return `${field}:\n${formattedPackages}`;
			});
	});

	return content;
}

function formatDescriptionFile(filePath: string): string {
	const content = readFile(filePath);
	const fields = ['Imports', 'Suggests', 'Depends', 'LinkingTo', 'Enhances'];

	const formattedContent = formatDescriptionContent(content, fields);
	// Write back to the file
	writeFile(filePath, formattedContent);
	return formattedContent;
}

export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "r-dep-sort" is now active!');
	let disposable = vscode.commands.registerCommand('r-dep-sort.format', () => {
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			const workspaceFolder = vscode.workspace.workspaceFolders[0];
			const filePath = path.join(workspaceFolder.uri.fsPath, 'DESCRIPTION');

			try {
				let formattedContent = formatDescriptionFile(filePath);
				// Further actions with formattedContent
			} catch (error: any) {
				vscode.window.showErrorMessage(`Error: ${error.message}`);
			}
		} else {
			vscode.window.showErrorMessage("No workspace folder found.");
		}
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
