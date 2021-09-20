"use strict"

$(function(){

    let filemanager = $('.filemanager')
    let breadcrumbs = $('.breadcrumbs')
    let fileList = filemanager.find('.data')


    $.get('scan', function(data) {
        let response = [data]
        let currentPath = ''
        let breadcrumbsUrls = []
        let folders = []
        let files = []



        $(window).on('hashchange', function() {
            goto(window.location.hash)

        }).trigger('hashchange')


        filemanager.find('.search').click(function() {
            let search = $(this)
            search.find('span').hide()
            search.find('input[type=search]').show().focus()
        })



        filemanager.find('input').on('input', function(e) {
            folders = []
            files = []

            let value = this.value.trim()

            if (value.length) {
                filemanager.addClass('searching')

                window.location.hash = 'search=' + value.trim()
            }
            else {
                filemanager.removeClass('searching')
                window.location.hash = encodeURIComponent(currentPath)
            }
        }).on('keyup', function(e) {
            let search = $(this)

            if(e.keyCode == 27) {
                search.trigger('focusout')
            }

        }).focusout(function(e) {
            let search = $(this)

            if(!search.val().trim().length) {
                window.location.hash = encodeURIComponent(currentPath)
                search.hide()
                search.parent().find('span').show()
            }
        })


        fileList.on('click', 'li.folders', function(e) {
            e.preventDefault()

            let nextDir = $(this).find('a.folders').attr('href')

            if(filemanager.hasClass('searching')) {
                breadcrumbsUrls = generateBreadcrumbs(nextDir)

                filemanager.removeClass('searching')
                filemanager.find('input[type=search]').val('').hide()
                filemanager.find('span').show()
            }
            else {
                breadcrumbsUrls.push(nextDir)
            }

            window.location.hash = encodeURIComponent(nextDir)
            currentPath = nextDir
        })


        breadcrumbs.on('click', 'a', function(e){
            e.preventDefault()

            let index = breadcrumbs.find('a').index($(this))
            let nextDir = breadcrumbsUrls[index]

            breadcrumbsUrls.length = Number(index)

            window.location.hash = encodeURIComponent(nextDir)
        })


        function goto(hash) {
            hash = decodeURIComponent(hash).slice(1).split('=')

            if (hash.length) {
                let rendered = ''

                if (hash[0] === 'search') {
                    filemanager.addClass('searching')
                    rendered = searchData(response, hash[1].toLowerCase())

                    if (rendered.length) {
                        currentPath = hash[0]
                        render(rendered)
                    }
                    else {
                        render(rendered)
                    }
                }

                else if (hash[0].trim().length) {
                    rendered = searchByPath(hash[0])

                    if (rendered.length) {
                        currentPath = hash[0]
                        breadcrumbsUrls = generateBreadcrumbs(hash[0])
                        render(rendered)
                    }
                    else {
                        currentPath = hash[0]
                        breadcrumbsUrls = generateBreadcrumbs(hash[0])
                        render(rendered)
                    }
                }

                else {
                    currentPath = data.path
                    breadcrumbsUrls.push(data.path)
                    render(searchByPath(data.path))
                }
            }
        }

        function generateBreadcrumbs(nextDir){
            let path = nextDir.split('/').slice(0)
            for (let i=1; i<path.length; i++){
                path[i] = path[i-1]+ '/' +path[i]
            }
            return path
        }


        function searchByPath(dir) {
            let path = dir.split('/')
            let demo = response
            let flag = 0

            for (let i=0; i<path.length; i++) {
                for (let j=0; j<demo.length; j++) {
                    if (demo[j].name === path[i]) {
                        flag = 1
                        demo = demo[j].items
                        break
                    }
                }
            }

            demo = flag ? demo : []
            return demo
        }


        function searchData(data, searchTerms) {
            data.forEach(function(d) {
                if (d.type === 'folder') {
                    searchData(d.items,searchTerms)

                    if (d.name.toLowerCase().match(searchTerms)) {
                        folders.push(d)
                    }
                }
                else if (d.type === 'file') {
                    if (d.name.toLowerCase().match(searchTerms)) {
                        files.push(d)
                    }
                }
            })
            return {folders: folders, files: files}
        }


        function render(data) {
            let scannedFolders = []
            let scannedFiles = []

            if (Array.isArray(data)) {
                data.forEach(function(d) {
                    if (d.type === 'folder') {
                        scannedFolders.push(d)
                    }
                    else if (d.type === 'file') {
                        scannedFiles.push(d)
                    }
                })
            }
            else if (typeof data === 'object') {
                scannedFolders = data.folders
                scannedFiles = data.files
            }


            fileList.empty().hide()

            if (!scannedFolders.length && !scannedFiles.length) {
                filemanager.find('.nothingfound').show()
            }
            else {
                filemanager.find('.nothingfound').hide()
            }

            if (scannedFolders.length) {
                scannedFolders.forEach(function(f) {
                    let itemsLength = f.items.length
                    let name = escapeHTML(f.name)
                    let icon = '<span class="icon folder"></span>'

                    if (itemsLength) {
                        icon = '<span class="icon folder full"></span>'
                    }
                    if (itemsLength == 1) {
                        itemsLength += ' item'
                    }
                    else if (itemsLength > 1) {
                        itemsLength += ' items'
                    }
                    else {
                        itemsLength = 'Empty'
                    }

                    let folder = $('<li class="folders"><a href="'+ f.path +'" title="'+ f.path +'" class="folders">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>')
                    folder.appendTo(fileList)
                })
            }

            if (scannedFiles.length) {
                scannedFiles.forEach(function(f) {
                    let fileSize = bytesToSize(f.size)
                    let name = escapeHTML(f.name)
                    let fileType = name.split('.')
                    let icon = '<span class="icon file"></span>'

                    fileType = fileType.length > 1 ? fileType[fileType.length-1] : ''

                    icon = '<span class="icon file f-' + fileType + '">' + fileType + '</span>'

                    let file = $('<li class="files"><a href="'+ f.path+'" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>')
                    file.appendTo(fileList)
                })
            }


            let url = ''

            if (filemanager.hasClass('searching')) {
                url = '<span>Search results: </span>'
                fileList.removeClass('animated')
            }
            else {
                fileList.addClass('animated')
                breadcrumbsUrls.forEach(function (u, i) {
                    let name = u.split('/')

                    if (i !== breadcrumbsUrls.length - 1) {
                        url += '<a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> <span class="arrow">→</span> '
                    }
                    else {
                        url += '<span class="folderName">' + name[name.length-1] + '</span>'
                    }
                })
            }

            breadcrumbs.text('').append(url)


            fileList.animate({'display':'inline-block'})
        }


        function escapeHTML(text) {
            return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
        }


        function bytesToSize(bytes) {
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
            if (bytes == 0) return '0 Bytes'
            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
        }
    })
})
