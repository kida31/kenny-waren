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


function calcBundlesNeeded(current, currentCol, target, targetCol, sizeCol) {
    if (current === undefined || target === undefined) {
        console.error(current, target)
    }

    const needQ = target[targetCol];

    if (needQ <= 0) {
        return 0;
    }

    const sizeQ = target[sizeCol];

    if (sizeQ <= 0) {
        throw new Error("bundle size cannot be negative: " + target.toString())
    }

    let haveQ = 0;
    if (current !== null) {
        haveQ = current[currentCol];
    }

    return (needQ - haveQ) / sizeQ;
}

function _createDiffList(targetData, haveData, joinCol, haveCol, needCol, sizeCol) {
    const result = []

    for (const targetItem of targetData) {
        const haveList = loc(haveData, joinCol, targetItem[joinCol])
        const haveItem = haveList.length > 0 ? haveList[0] : null;

        let q = calcBundlesNeeded(haveItem, haveCol, targetItem, needCol, sizeCol)
        q = Math.trunc(q);

        if (q <= 0) {
            continue;
        }

        const out = {...targetItem, ...haveItem, 'to-buy': q}

        //delete out[haveCol]
        //delete out[needCol]
        //delete out[sizeCol]

        result.push(out)
    }

    return result;
}

