import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined;

  // MARK: - Colors

  const lineNumberColor = new vscode.ThemeColor("editorLineNumber.foreground");
  const activeLineNumberColor = new vscode.ThemeColor(
    "editorLineNumber.activeForeground"
  );

  // MARK: - Decorator types

  // marks without lines
  const markDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    fontWeight: "bold",
    // color: lineNumberColor,
  });

  // marks with a - line above!
  const markLineDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    fontWeight: "bold",
    border: `
		border: none;
		border-top: 1px solid;
		margin-top: 0px;
		`,
    // margin-top: -1px;
    borderColor: lineNumberColor,
    // color: lineNumberColor,
  });

  // bold section of the mark comment
  const markBoldDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: false,
    fontWeight: "normal !important",
    // color: lineNumberColor,
  });

  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    const text = activeEditor.document.getText();

    const simpleMarkRegex =
      /^[\t ]*(((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:)\s*[^-])/gm;
    const lineMarkRegex = /^[\t ]*((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:\s*-)/gm;

    // const simpleMarkRegex = /(((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:)\s*[^-])/g;
    // const lineMarkRegex = /((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:\s*-)/g;

    const simpleMarks: vscode.DecorationOptions[] = [];
    const lineMarks: vscode.DecorationOptions[] = [];
    const marksBold: vscode.DecorationOptions[] = [];

    // MARK: - Match simple marks

    let match;
    while ((match = simpleMarkRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[2].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      simpleMarks.push(decoration);
      marksBold.push(decoration);
    }

    // MARK: - Match marks with lines

    match = null;
    while ((match = lineMarkRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      lineMarks.push(decoration);
      marksBold.push(decoration);
    }

    activeEditor.setDecorations(markLineDecorationType, lineMarks);
    activeEditor.setDecorations(markDecorationType, simpleMarks);
    activeEditor.setDecorations(markBoldDecorationType, marksBold);
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
}
