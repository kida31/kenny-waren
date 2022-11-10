// module "my-module.js"
function parse(arr) {
    const headers = arr[0]

    const dataDicts = []

    for (const row of arr.slice(1)) {
        const dataset = {}
        for (const [idx, h] of headers.entries()) {
            if (h === "") {
                console.warn("Skipped empty header in column " + idx)
                continue;
            }
            dataset[h] = row[idx]
        }
        dataDicts.push(dataset)
    }

    return dataDicts
}

function inverseParse(dictList) {
    if (dictList.length === 0) {
        return []
    }

    const headers = Object.keys(dictList[0])

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


function calcBundlesNeeded(item, haveCol, needCol, sizeCol) {
    if (item === undefined) {
        throw new Error("Item was unidentified")
    }

    const needQ = item[needCol] === "" ? 0 : item[needCol] ?? 0;
    const haveQ = item[haveCol] === "" ? 0 : item[haveCol] ?? 0;
    const sizeQ = item[sizeCol] === "" ? 1 : item[sizeCol] ?? -1;

    if (sizeQ <= 0) {
        throw new Error("invalid bundle size for " + JSON.stringify(item))
    }

    return (needQ - haveQ) / sizeQ;
}

function _createDiffList(allItems, haveItems, joinCol, haveCol, needCol, sizeCol) {
    const result = []

    for (const item of allItems) {
        const matches = loc(haveItems, joinCol, item[joinCol])
        const haveItem = matches.length > 0 ? matches[0] : null;

        const mergedItem = {...haveItem, ...item}
        let q = calcBundlesNeeded(mergedItem, haveCol, needCol, sizeCol)
        q = Math.trunc(q);

        if (q <= 0) {
            continue;
        }

        const out = {...mergedItem, 'to-buy': q}

        result.push(out)
    }

    return result;
}

