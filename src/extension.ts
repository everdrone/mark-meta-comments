import * as vscode from "vscode";

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined;

  const lineNumberColor = new vscode.ThemeColor("editorLineNumber.foreground");
  const activeLineNumberColor = new vscode.ThemeColor(
    "editorLineNumber.activeForeground"
  );

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

    const regex = /(((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:)\s*[^-])/g;
    const lineRegex = /((\/\/|\#)\s*([A-Z][A-Z0-9_-\s]+)\s*:\s*-)/g;

    // const regex = /(((\/\/|\#)\s*MARK\s*:)\s*[^-])/gi;
    // const lineRegex = /((\/\/|\#)\s*MARK\s*:\s*-)/gi;
    // const boldRegex = /(?:(\/\/|\#)\s*MARK\s*:\s*-)(.*)$/gim;
    const text = activeEditor.document.getText();

    const marks: vscode.DecorationOptions[] = [];
    const markLines: vscode.DecorationOptions[] = [];
    const marksBold: vscode.DecorationOptions[] = [];

    let match;
    while ((match = regex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[2].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
        // hoverMessage: "Number **" + match[0] + "**",
      };

      marks.push(decoration);
      marksBold.push(decoration);
    }

    match = null;
    while ((match = lineRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
        // hoverMessage: "Number **" + match[0] + "**",
      };

      markLines.push(decoration);
      marksBold.push(decoration);
    }

    activeEditor.setDecorations(markLineDecorationType, markLines);
    activeEditor.setDecorations(markDecorationType, marks);
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
