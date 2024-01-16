function fetchArxivData() {
    var url = 'http://export.arxiv.org/api/query?search_query=(cat:cs.*%20AND%20(jrnl:Web%20Conference%20OR%20jrnl:SIGMOD%20OR%20jrnl:ICDE%20OR%20jrnl:WWW%20OR%20jrnl:VLDB%20OR%20jrnl:ICDCS))&sortBy=submittedDate&sortOrder=descending&max_results=1';
    var xml = UrlFetchApp.fetch(url).getContentText();
    var document = XmlService.parse(xml);
    var root = document.getRootElement();
    var atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
    var arxivNs = XmlService.getNamespace('http://arxiv.org/schemas/atom');
    var entries = root.getChildren('entry', atomNs);

    var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var data = sheet.getDataRange().getValues();
    var existingIds = data.map(function (row) {
        return row[0];
    });

    var effectiveNumOfCount = 0;
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var id = entry.getChild('id', atomNs).getText();

        // 既存の行とIDが重複している場合はスキップ
        if (existingIds.indexOf(id) !== -1) {
            continue;
        }
        effectiveNumOfCount++;

        var updated = entry.getChild('updated', atomNs).getText();
        var published = entry.getChild('published', atomNs).getText();
        var title = entry.getChild('title', atomNs).getText();
        var summary = entry.getChild('summary', atomNs).getText();
        var authors = entry.getChildren('author', atomNs).map(function (author) {
            return author.getChild('name', atomNs).getText();
        }).join(', ');
        var comment = entry.getChild('comment', arxivNs) ? entry.getChild('comment', arxivNs).getText() : '';
        var link = entry.getChild('link', atomNs).getAttribute('href').getValue();
        var primaryCategory = entry.getChild('primary_category', arxivNs).getAttribute('term').getValue();
        var categories = entry.getChildren('category', atomNs).map(function (category) {
            return category.getAttribute('term').getValue();
        }).join(', ');

        var summarizedJapanese = summarizeInJapanese(link, title, summary);
        var lineNotifyMsg = `${title}\n${summarizedJapanese}\n${link}`
        sendLineNotify(lineNotifyMsg);
        sheet.appendRow([
            id, updated, published, title, summary, summarizedJapanese,
            authors, comment, link, primaryCategory, categories
        ]);
    }

    if (effectiveNumOfCount === 0) {
        sendLineNotify("There is no new thesis to notify in today's execution.")
    }
}


function summarizeInJapanese(paperUrl, paperTitle, paperSummary) {
    var prompt = "URL: " + paperUrl + "\nTitle: " + paperTitle + "\nEnglish Summary (Technical): " + paperSummary +
        "\n\nTask: Please translate the above technical summary into Japanese. Simplify any complex technical terms for clarity and make it understandable for a server-side engineer who may not be a specialist in this specific field.";

    var payload = {
        model: "gpt-4",
        messages: [{
            role: "system",
            content: prompt
        }]
    };

    var options = {
        method: "post",
        contentType: "application/json",
        headers: {
            Authorization: "Bearer " + CONFIG.OPENAPI_KEY
        },
        payload: JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(CONFIG.OPENAPI_ENDPOINT, options);
    // Logger.log(response)
    var jsonResponse = JSON.parse(response.getContentText());
    var translatedSummary = jsonResponse.choices[0].message.content.trim();
    return translatedSummary;
}

function sendLineNotify(message) {
    var options = {
        "method": "post",
        "payload": "message=" + message,
        "headers": {"Authorization": "Bearer " + CONFIG.LINE_NOTIFY_TOKEN}
    };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}


// Register time-based trigger to exec fetchArxivData
function createTimeDrivenTriggers() {
    ScriptApp.newTrigger('fetchArxivData')
        .timeBased()
        .everyDays(1)
        .atHour(12)
        .create();
}
