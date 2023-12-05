import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined;

  // MARK: - Colors

  const lineNumberColor = new vscode.ThemeColor("editorLineNumber.foreground");
  const activeLineNumberColor = new vscode.ThemeColor(
    "editorLineNumber.activeForeground"
  );

  // MARK: - Decorator types

  // marks with a - line above!
  const markLineAboveDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    border: `
		border: none;
		border-top: 1px solid;
		margin-top: 0px;
		`,
    // margin-top: -1px;
    borderColor: lineNumberColor,
    // color: lineNumberColor,
  });

	  // marks with a - line below!
	const markLineBelowDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    border: `
		border: none;
		border-bottom: 1px solid;
		margin-bottom: 0px;
		`,
    // margin-bottom: -1px;
    borderColor: lineNumberColor,
    // color: lineNumberColor,
  });

  // bold section of the mark comment
  const markBoldDecorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: false,
    fontWeight: "bold !important",
    // color: lineNumberColor,
  });

  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    const text = activeEditor.document.getText();

    const pragmaMarkNoneRegex = /^([\t ]*)((\/\/|\#)[\t ]*pragma\smark[\t ]+)(.*)$/gim;
    const pragmaMarkAboveRegex = /^([\t ]*)((\/\/|\#)[\t ]*pragma\smark[\t ]+-)(.*)$/gim;
    const pragmaMarkBelowRegex = /^([\t ]*)((\/\/|\#)[\t ]*pragma\smark[\t ]+)(.*)([\t ]+-[\t ]*)$/gim;
    const lineMarkNoneRegex = /^[\t ]*((\/\/|\#)[\t ]*([A-Z][A-Z0-9\t _-]+):[\t ]+)(.*)$/gm;
    const lineMarkAboveRegex = /^[\t ]*((\/\/|\#)[\t ]*([A-Z][A-Z0-9\t _-]+):[\t ]+-)(.*)$/gm;
		const lineMarkBelowRegex = /^[\t ]*((\/\/|\#)[\t ]*([A-Z][A-Z0-9\t _-]+):[\t ]+)(.+)([\t ]+-[\t ]*)$/gm;

    const lineMarksAbove: vscode.DecorationOptions[] = [];
    const lineMarksBelow: vscode.DecorationOptions[] = [];
    const marksBold: vscode.DecorationOptions[] = [];

    let match;

    // MARK: - Match any mark

    match = null;

    while ((match = lineMarkNoneRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      marksBold.push(decoration);
    }

    // MARK: - Match marks with lines above

    match = null;

    while ((match = lineMarkAboveRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      lineMarksAbove.push(decoration);
    }

    // MARK: - Match marks with lines below

    match = null;

    while ((match = lineMarkBelowRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      lineMarksBelow.push(decoration);
    }

    // MARK: - Match any pragma mark

    match = null;

    while ((match = pragmaMarkNoneRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      marksBold.push(decoration);
    }

    // MARK: - Match pragma marks with lines above

    match = null;

    while ((match = pragmaMarkAboveRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      lineMarksAbove.push(decoration);
    }

    // MARK: - Match pragma marks with lines below

    match = null;

    while ((match = pragmaMarkBelowRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );

      const decoration = {
        range: new vscode.Range(startPos, endPos),
      };

      lineMarksBelow.push(decoration);
    }

    activeEditor.setDecorations(markLineAboveDecorationType, lineMarksAbove);
    activeEditor.setDecorations(markLineBelowDecorationType, lineMarksBelow);
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
