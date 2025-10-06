# Fix workspace-initialization.integration.test.ts
$content = Get-Content 'src/test/suite/workspace-initialization.integration.test.ts' -Raw
$content = $content -replace '\(vscode\.commands\.executeCommand as unknown as \(command: string, \.\.\.args: unknown\[\]\) => Promise<unknown>\) = async \(command: string, \.\.\._args: unknown\[\]\) =>', '(vscode.commands.executeCommand as unknown as (command: string, ...args: unknown[]) => Promise<unknown>) = async (command: string, ...args: unknown[]) =>'
$content = $content -replace 'vscode\.window\.showInformationMessage = async \(message: string, _options\?: vscode\.MessageOptions, \.\.\._items: string\[\]\) =>', 'vscode.window.showInformationMessage = async (message: string, _options?: vscode.MessageOptions, ...items: string[]) =>'
$content = $content -replace 'vscode\.window\.showWarningMessage = async \(_message: string, _options\?: vscode\.MessageOptions, \.\.\._items: string\[\]\) =>', 'vscode.window.showWarningMessage = async (message: string, _options?: vscode.MessageOptions, ..._items: string[]) =>'
Set-Content 'src/test/suite/workspace-initialization.integration.test.ts' -Value $content

# Fix custom-steering.integration.test.ts
$content = Get-Content 'src/test/suite/custom-steering.integration.test.ts' -Raw
$content = $content -replace 'let validationError: string \| undefined;', 'let validationError: string | vscode.InputBoxValidationMessage | Thenable<string | vscode.InputBoxValidationMessage | null | undefined> | null | undefined;'
Set-Content 'src/test/suite/custom-steering.integration.test.ts' -Value $content

Write-Host "Fixed all files"
