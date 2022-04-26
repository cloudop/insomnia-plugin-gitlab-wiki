# GitLab wiki for Insomnia

该插件可以将api请求的参数，响应（json）及接口描述同步传到wiki下
以markdown形式展示，并按uri路径进行分级

## Insomnia Documentation:
* https://docs.insomnia.rest/insomnia/introduction-to-plugins

# Usage

1. 点击左上项目名 > 设置gitlab wiki 仓库url
2. 点击pull将已存在的接口文档同步回insomnia
3. 编写api接口，点击send，就可以选择push到wiki，markdown文档可以自动生成
4. 修改文档之后将不再自动生成，需要重新生成可以将它删除再push
5. 修改参数之后需要重新send之后再push
```json
{
"dev": "http://ocean.advertise.local",
"advertiser_id": "媒体账户ID",
"ad_id": "计划ID",
"_method": "改写请求方法"
}
```
6. 环境变量会自动应用到参数与响应的Description中
7. json中多维的数据会在下方以单独的表格展示，并且所属key会增加锚点

# ScreenShots

![doc](https://github.com/cloudop/insomnia-plugin-gitlab-wiki/blob/main/ScreenShots/doc.png)

![wiki](https://github.com/cloudop/insomnia-plugin-gitlab-wiki/blob/main/ScreenShots/wiki.png)

![wiki_menu](https://github.com/cloudop/insomnia-plugin-gitlab-wiki/blob/main/ScreenShots/wiki_menu.png)