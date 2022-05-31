const fs = require('fs');

class Wiki {
    setReqRes(reqId, req, res, data)
    {
        let env = req.getEnvironment();
        let mdReq = this.mdReq(req, env);
        let mdRes = this.mdRes(res, env);
        fs.writeFileSync(this.getReqTmpDir(reqId)+ '/reqres', mdReq + mdRes);
    }

    getReqTmpDir(reqId)
    {
        let folder = __dirname + '/tmp/' + reqId;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        return folder;
    }

    mdReq(req, env)
    {
        // console.log(req);
        let body = req.getBody();
        // console.log(body)
        let reqData = {};
        switch (body.mimeType) {
            case 'application/json':
                reqData = this.appJson(body.text);
                break;
            default:
        }
        body.text = body.text.replace(/\t/g, '    ')
        let md = "\n## 请求参数\n```json\n"+ body.text+ "\n```";
        md = this.jsonToTable(md, reqData, env);
        return md;
    }

    mdRes(res, env)
    {
        console.log('-----------mdres------------')
        console.log(res);
        let reqData = ''+ res.getBody();
        try {
            reqData = JSON.parse(reqData);
            // body.text = body.text.replace(/\t/g, '    ')
            let md = "\n## 响应\n```json\n"+ JSON.stringify(reqData, null, 4)+ "\n```";
            console.log(md);
            md = this.jsonToTable(md, reqData, env);
            return md;
        } catch (e) {
            return '';
        }
    }

    appJson(json)
    {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.log(e.message)
            return '';
        }
    }

    explainParam(key, env)
    {
        if (typeof env[key] !== 'undefined') {
            return env[key];
        } else {
            return '';
        }
    }

    jsonToTable(md, jsonData, env)
    {
        let links = {};
        md += `
| Field | Type | Value | Description |
|-------|------|-------| ----------- |
`
        for (let key in jsonData) {
            if (!jsonData.hasOwnProperty(key)) {
                continue;
            }

            let desc = this.explainParam(key, env);
            let value = jsonData[key];
            let type = typeof value;
            if (type === 'object') {
                links[key] = value;
                // value = '['+ value+ '](#'+ key+ ')';
                value = JSON.stringify(value);
                key = '['+ key+ '](#'+ key+ ')';
            }
            md += `| ${key} | ${type} | ${value} | ${desc} | \n`
        }
        if (links) {
            for (let key in links) {
                if (!links.hasOwnProperty(key)) {
                    continue;
                }
                md += `\n- ${key}\n`;
                if (Array.isArray(links[key])) {
                    if (Array.isArray(links[key][0])) {
                        md = this.jsonToTable(md, links[key][0], env);
                    } else {
                        md = this.jsonToTable(md, links[key], env);
                    }
                } else {
                    md = this.jsonToTable(md, links[key], env);
                }
            }
        }
        return md;
    }
}

module.exports = new Wiki();