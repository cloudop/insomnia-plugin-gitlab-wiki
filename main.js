const Workspace = require('./Workspace');
const Sync = require('./Sync');
const SyncToServer = require('./SyncToServer');
const SyncToLocal = require('./SyncToLocal');
const fs = require('fs');
const Wiki = require('./Wiki');

module.exports.workspaceActions = [
    {
        label: '设置gitlab wiki',
        icon: 'fa-git',
        action: async (context, data) => {
            await Sync.setupRepoUrl(context, data);
        },
    },
    {
        label: 'Pull from GIT',
        icon: 'fa-arrow-down',
        action: async (context, data) => {
            if (await Sync.isSetup(context, data) === false) {
                return;
            }

            await SyncToLocal.pull(context, data);
            Workspace.importProject(context, data);
        },
    },
    {
        label: 'Push to GIT',
        icon: 'fa-arrow-up',
        action: async (context, data) => {
            console.log('-----------------workspace action--------------')
            console.log(context);
            console.log(data);
            if (await Sync.isSetup(context, data) === false) {
                return;
            }
            const expFilename = await Workspace.exportProject(context, data);
            if (!expFilename) {
                return;
            }

            // await Workspace.exportMd(context, data);
            // await SyncToServer.push(context, data, mdFilename);

            await SyncToServer.push(context, data, expFilename);
            Workspace.importProject(context, data);
        },
    }
];
// module.exports.requestHooks = [
//     async (RequestHooks) => {
//         console.log('--------request hook---------');
//         console.log(RequestHooks)
//         console.log(RequestHooks.request.getBody())
//         let body = RequestHooks.request.getBody();
//         console.log(RequestHooks.request.getParameter('name'))
//     }
// ];
module.exports.responseHooks = [
    async (ResponseHook) => {
        // workingDir = Workspace.getWorkingDir()
        // fs.writeFileSync(expFilename, JSON.stringify(expObj));
        // ResponseHook.app == 'AppContext';
        let md = '';
        md += 'id:'+ ResponseHook.request.getId()+ "\n";
        md += 'url:'+ ResponseHook.request.getUrl()+ "\n";
        md += 'body:'+ ResponseHook.request.getBody()+ "\n";
        md += 'method:'+ ResponseHook.request.getMethod()+ "\n";
        md += 'res body:'+ ResponseHook.response.getBody()+ "\n";
        md += 'enviroment:'+ ResponseHook.request.getEnvironment();
        console.log('--------response hook---------');
        console.log(ResponseHook)
        console.log(ResponseHook.request.getBody())
        console.log(md);
        console.log(ResponseHook.request.getEnvironment());
        console.log(ResponseHook.response.getBody());
        Wiki.setReqRes(
            ResponseHook.request.getId(),
            ResponseHook.request,
            ResponseHook.response,
            ResponseHook.data
        )
    }
];

