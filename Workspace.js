const fs = require('fs');
const simpleGit = require('simple-git');

class Workspace {
    importProject(context, data) {
        const impFilename = this.getWorkspaceFile(data);
        if (!fs.existsSync(impFilename)) {
            // noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
            context.app.alert('Error importing',
                'Seems there is no configuration within your repository that can be read! Push first!');
            return false;
        }

        fs.readFile(impFilename, "utf8", function (err, fileContent) {
            // noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
            context.data.import.raw(fileContent, {
                workspaceId: data.workspace._id,
            });
        });

        return true;
    }

    async exportProject(context, data) {
        // noinspection JSUnresolvedVariable,JSCheckFunctionSignatures,JSUnresolvedFunction
        let exp = await context.data.export.insomnia({
            includePrivate: false,
            format: 'json',
            workspace: data.workspace,
        });

        // modify data to not have that much conflicts and fix environment imports
        exp = exp.replaceAll(data.workspace._id, '__WORKSPACE_ID__');
        const expObj = JSON.parse(exp);
        expObj.__export_date = '2022-04-02T14:27:43.046Z';
        expObj.__export_source = 'insomnia.desktop.app:v2022.2.1';
        let tmpArr = [];
        for (let i = 0; i < expObj.resources.length; i++) {
            let desc = this.fillEmptyDescription(expObj.resources[i]._id, expObj.resources[i]);
            if (desc) {
                expObj.resources[i].description = desc;
            }
            let catalog = this.getRequestCatalog(expObj.resources, expObj.resources[i].parentId, expObj.resources[i]._type);
            // console.log('catalog:'+ catalog);
            this.commitWikiMd(expObj.resources[i], data.workspace._id, data.workspace, catalog);
            if (expObj.resources[i]._type === 'api_spec'
                || expObj.resources[i]._type === 'cookie_jar') {
                // remove this as it makes many merge conflicts
                continue;
            }
            expObj.resources[i].modified = '1637671845661';
            if (expObj.resources[i]._type !== 'environment') {
                tmpArr.push(expObj.resources[i]);
                continue;
            }
            if (expObj.resources[i].parentId === '__WORKSPACE_ID__') {
                expObj.resources[i]._id = '__BASE_ENVIRONMENT_ID__';
                tmpArr.push(expObj.resources[i]);
                continue;
            }
            if (expObj.resources[i].parentId.startsWith('env_')) {
                expObj.resources[i].parentId = '__BASE_ENVIRONMENT_ID__';
            }
            tmpArr.push(expObj.resources[i]);
        }
        expObj.resources = tmpArr;

        const expFilename = this.getWorkspaceFile(data);
        fs.writeFileSync(expFilename, JSON.stringify(expObj));
        return expFilename;
    }

    commitWikiMd(resource, workspaceId, workspace, catalog)
    {
        console.log(resource)
        let reqId = resource['_id'];
        if (reqId.indexOf('req') !== 0) {
            return false;
        }
        let url = resource['url'];
        url = url.replace(/{{.*?}}/, '');
        let reqres = '请求方式 **'+ resource['method']+ "**\n\n";
            reqres += '请求地址 **'+ url+ "**\n\n";
            reqres += resource['description'];
        let mdDir = __dirname+ '/git/'+ workspaceId+ '/'+ catalog;
        if (!fs.existsSync(mdDir)) {
            fs.mkdirSync(mdDir, { recursive: true });
        }
        let mdFileName = mdDir+ resource.name+'.md';
        fs.writeFileSync(mdFileName, reqres);
        const folder = this.getWorkingDir(workspace);
        const sGit = simpleGit(folder);
        sGit.add(mdFileName);
        return true;
    }

    async exportMd(context, data)
    {
        // let exp = await context.data.export.insomnia({
        //     includePrivate: false,
        //     format: 'json',
        //     workspace: data.workspace,
        // });
        // for (let i = 0; i < expObj.resources.length; i++) {
        //
        // }

        // {{env}}/tt/ad/realtime_status
        const folder = this.getWorkingDir(data.workspace);
        const sGit = simpleGit(folder);
        for (let i in data.requests) {
            let url = data.requests[i].url;
            url = url.replace(/{{.*?}}/, '');
            let urlArr = url.split('/');
            let mdName = urlArr.pop();
            let subDir = urlArr.join('/');
            console.log(url);
            console.log(mdName);
            console.log(subDir);
            let reqId = data.requests[i]._id
            let reqresFile = __dirname+ '/tmp/'+ reqId+ '/'+ 'reqres';
            let reqres = fs.readFileSync(reqresFile);
            reqres = data.requests[i].description + reqres;
            let mdDir = __dirname+ '/git/'+ data.workspace._id+ subDir;
            console.log(mdDir)
            if (!fs.existsSync(mdDir)) {
                let foo = fs.mkdirSync(mdDir, { recursive: true });
                console.log(foo)
            }
            let mdFileName = mdDir+ '/' + mdName+'.md';
            fs.writeFileSync(mdFileName, reqres);
            sGit.add(mdFileName);
            // await SyncToServer.push(context, data, mdFileName);
        }
    }

    fillEmptyDescription(reqId, resouce)
    {
        if (reqId.indexOf('req') !== 0) {
            return '';
        }
        // console.log(reqId);
        // console.log(resouce);
        if (!resouce.description) {
            let reqresFile = __dirname+ '/tmp/'+ reqId+ '/'+ 'reqres';
            if (fs.existsSync(reqresFile)) {
                let buf = fs.readFileSync(reqresFile);
                return buf.toString('utf-8');
            } else {
                return '';
            }
        }
        return '';
    }

    getWorkingDir(workspace) {
        if (!workspace || !workspace._id) {
            return false;
        }
        let folder = __dirname + '/git';
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        folder = __dirname + '/git/' + workspace._id;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        return folder;
    }

    /* helper methods */
    sanitizeString(str) {
        str = str.replace(/[^a-z0-9\._-]/gim, "_");
        return str.trim();
    }

    getWorkspaceFile(data) {
        return this.getWorkingDir(data.workspace) + '/workspace.json';
    }

    getRequestCatalog(resources, parentId, type) {
        if (type !== 'request') {
            return '';
        }
        let end = false;
        let catalog = '';
        do {
            for (let i = 0; i < resources.length; i++) {
                if (resources[i]._id === parentId) {
                    if (resources[i]._type === 'request_group') {
                        catalog = resources[i].name+ '/'+ catalog;
                        parentId = resources[i].parentId;
                        break;
                    }

                    if (resources[i]._type === 'workspace') {
                        end = true;
                        break;
                    }
                }
            }
        } while (end === false);
        return catalog;
    }
}

module.exports = new Workspace();
