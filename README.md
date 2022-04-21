# GitLab wiki for Insomnia

该插件可以将api请求的参数，响应（json）及接口描述同步传到wiki下
以markdown形式展示，并按uri路径进行分级

## Insomnia Documentation:
* https://docs.insomnia.rest/insomnia/introduction-to-plugins

# Usage

1. 点击左上项目名 > 设置gitlab wiki 仓库url
2. 点击pull将已存在的接口文档同步会insomnia
3. 编写api接口，点击send，就可以选择push到wiki，markdown文档可以自动生成
4. 修改文档之后将不再自动生成，需要重新生成可以将它删除再push
5. 修改参数之后需要重新send之后再push