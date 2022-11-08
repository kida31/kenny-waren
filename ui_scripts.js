function displayToast(name) {
    SpreadsheetApp.getActive().toast("Hi " + name + "!");
}

function ping(){
    return 'pong'
}

function js_getSheetNames(id){
    const ss = SpreadsheetApp.openById(id);
    return ss.getSheets().map(s => s.getName());
}

function js_getColumns(id, sheets){
    const ss = SpreadsheetApp.openById(id);
    const results = []
    for (const name of sheets){
        const sheet = ss.getSheetByName(name)
        const headers = sheet.getRange("1:1").getValue()[0]
        headers.forEach(h => {
            if (h !== ""){
                results.push(h)
            }
        })
    }

    return results
}
function test(){
    alert(123)
}