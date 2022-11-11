// module "my-module.js"
function parse(arr) {
    const headers = arr[0]

    const dataDicts = []

    /* all rows after header */
    for (const row of arr.slice(1)) {
        const dataset = {}
        for (const [idx, h] of headers.entries()) {
            if (h === "") {
                console.warn("Skipped empty header in column " + idx)
                continue;
            }
            dataset[h] = row[idx]
        }

        if (Object.values(dataset).every(value => value === "")) {
            continue;
        }

        dataDicts.push(dataset)
    }

    return dataDicts
}

function inverseParse(dictList) {
    if (dictList.length === 0) {
        return []
    }

    const headers = [...new Set(dictList.map(item => Object.keys(item)).flat())]

    const result = [headers]

    for (const item of dictList) {
        const entry = []
        for (const key of headers) {
            entry.push(item[key])
        }
        result.push(entry)
    }

    return result
}

function loc(data, column_name, value) {
    const result = []

    if (data.length < 1) {
        throw new Error("Empty data");
    } else if (!column_name in data[0]) {
        throw new Error("Unknown key: " + column_name)
    }

    for (const item of data) {
        if (equals(item[column_name], value)) {
            result.push(item)
        }
    }
    return result
}

function equals(a, b) {
    return a.toString() === b.toString()
}


function _createDiffList(database, inventory, idCol, haveCol, needCol, sizeCol, verbose) {
    const result = [];

    for (const itemEntry of database) {
        if (!itemEntry[idCol]) {
            throw new Error("No identifier found for " + JSON.stringify(itemEntry));
        }
        const matches = loc(inventory, idCol, itemEntry[idCol]);

        const item = {
            ...(matches[0] ?? {}),
            ...itemEntry
        };

        if (!matches[0]) addLog(item, "missing:no equivalent in inventory");

        const autofill = function (obj, key, fallbackValue) {
            if (!obj[key] || obj[key] === "") {
                obj[key] = fallbackValue;
                addLog(obj, `autofill:${key}=${fallbackValue}`)
            }
        }
        
        autofill(item, needCol, 0)
        autofill(item, haveCol, 0)
        autofill(item, sizeCol, 1)

        const q = Math.trunc((item[needCol] - item[haveCol]) / item[sizeCol]);

        if (q <= 0) {
            continue;
        }

        item["BUY"] = q

        result.push(item)
    }

    for (const invItem of inventory) {
        if (!invItem[idCol]) {
            throw new Error("No identifier found for " + JSON.stringify(invItem));
        }

        if (loc(database, idCol, invItem[idCol]).length === 0) {
            const item = {...invItem};
            addLog(item, "missing:no equivalent in database");
            result.push(item);
        }
    }

    if (verbose){
        result.forEach(item => item["VERBOSE"] = popLog(item));
    } else {
        result.forEach(item => popLog(item));
    }

    return result;
}


const LOG_KEY = "INTERNAL_LOG"

function addLog(obj, text) {
    if (!obj[LOG_KEY]) obj[LOG_KEY] = []
    obj[LOG_KEY].push(text)
}

function popLog(obj) {
    if (obj[LOG_KEY]) {
        const str = obj[LOG_KEY].join("\n")
        delete obj[LOG_KEY]
        return str
    }

    return ""
}
