# kenny quick order function

## How to install

Add `Code.js` and `dataOperations.js` to your Google Sheet Project.


## How to use

### Option A - GUI

- Move to your recent inventory
- Go to the newly created custom menu
- Click on `Bestellung generieren`
- Enter the sheet names and column names as requested. There will be a final confirmation prompt

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
