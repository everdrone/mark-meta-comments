# Mark Meta Comments

This extension emulates XCode's `// MARK: -` comment decorations.

![A MARK comment separating one section of code from the next.](https://raw.githubusercontent.com/everdrone/mark-meta-comments/main/.github/media/screenshot.png)

###### Theme: [Sequoia Moonlight](https://marketplace.visualstudio.com/items?itemName=wicked-labs.sequoia)

# Installation

Install it from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=everdrone.mark-meta-comments)

# Usage

Just write `// MARK: Foo` or to get a regular mark comment (without the horizontal separator) or `// MARK: - Foo` to get the horizontal separator.

Any other word or combination of words can be put instead of `MARK`, like

```
// SECTION: - Foo

// SEE ALSO: - Bar

# PYTHON COMMENTS: - Also work!
```

## Todo:

- [ ] Add minimap decorators
- [ ] Add "Go To Symbol" feature
- [x] Allow `#` comments

## Contributing

Found a bug? Want a feature?

Feel free to open a new GitHub issue or start a new Pull Request!
