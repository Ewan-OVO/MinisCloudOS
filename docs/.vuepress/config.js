module.exports = {
    base: '/MinisCloudOS/',
    themeConfig: {
        searchMaxSuggestions: 10,
        sidebar: 'auto', //全局设定侧边栏
        logo: '/assets/img/logo.png',
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'About', link: '/about/' },
            {
                text: 'Contact',
                ariaLabel: 'contact Menu',
                items: [
                    { text: 'Email', link: '/contact/' },
                    { text: 'Phone', link: '/contact/' }
                ]
            },
            { text: 'External', link: 'https://google.com' },
        ],
        sidebar: {
            '/': [
                '',
                'about',
                'contact',
                'enable_assistance',
                '/list/'
            ],
            '/list/': [
                '/list/other1',
                '/list/other2'
            ]
        }
        // sidebar: [
        //     '',
        //     'about',
        //     'contact',
        //     {
        //         title: '组合模块',   // 必要的
        //         path: '/list/',     // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        //         collapsable: false, // 可选的, 默认值是 true,
        //         sidebarDepth: 1,    // 可选的, 默认值是 1
        //         children: [
        //             '/list/other1',
        //             '/list/other2'
        //         ]
        //     }
        // ]
    }
}