# kenny quick order function

## How to install

Add `Code.js` and `dataOperations.js` to your Google Sheet Project.


## How to use

### Option A - GUI

- Move to your recent inventory
- Go to the newly created custom menu
- Click on `T&T > Bestellung generieren...`
- Select the sheet and column names as prompted.

### Option B - Function
```js
getShoppingList(bestellSheetName, bestandSheetName,
    joinSpalte, istSpalte, sollSpalte, sizeSpalte);
```
For example like this:
```bash
# Into your Google Sheet Cell
=getShoppingList("Bestell1", "Bestand1", "Artikel Name", "Ist-Spalte", "Soll-Kapazität", "Verpackungseinheit")
```
[Example Google Sheet](https://docs.google.com/spreadsheets/d/1vHw9plhhQN4ENtLNp3ZcT7Lr9d5eEK-ONHCSTrcYc8g/)
