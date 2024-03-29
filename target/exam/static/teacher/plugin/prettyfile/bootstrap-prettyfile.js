﻿/*
 * jQuery and Bootsrap3 Plugin prettyFile
 *
 * version 2.0, Jan 20th, 2014
 * by episage, sujin2f
 * Git repository : https://github.com/episage/bootstrap-3-pretty-file-upload
 */
( function ($) {

    $.fn.extend({
        prettyFile: function (options) {
            var defaults = {
                text: "选择文件",
                title: "图片"
            };

            var options = $.extend(defaults, options);
            var plugin = this;

            function make_form($el, opt) {
                $el.wrap('<div></div>');
                $el.hide();
                $el.after('\
						<div class="input-append layui-form-item" style="margin-bottom: 0">\
							<div class="file-action layui-form-item input_group" style="margin-bottom: 0">\
								<input class="layui-input file-btn-input" readonly="readonly" type="text">\
								<span class="group_addon layui-btn layui-btn-primary file-btn-text">' + opt.text + '</span>\
								<span class="group_addon layui-btn file-btn-ku">文件库</span>\
								<input type="hidden" class="code file-btn-code" name="' + $el.attr("data-id") + '">\
								</div>\
						</div>\
					');

                return $el.parent();
            };
            var isIE = /msie/i.test(navigator.userAgent) && !window.opera;

            function bind_change($wrap, multiple, option) {
                $wrap.find('input[type="file"]').change(function () {
                    // When original file input changes, get its value, show it in the fake input
                    var fileSize = 0;
                    var files = $(this)[0].files,
                        info = '';

                    fileSize = files[0].size;
                    if (files.length == 0)
                        return false;

                    if (!multiple || files.length == 1) {
                        var path = $(this).val().split('\\');
                        info = path[path.length - 1];
                    } else if (files.length > 1) {
                        // Display number of selected files instead of filenames
                        info = "已选择了" + files.length + ' 个文件';
                    }

                    $wrap.find('.input-append input.layui-input').val(info);

                    //判断是否ajax上传文件
                    if ($(this).attr("data-ajax")) {
                        $('.ajax-file-form').remove();
                        var form = $("<form class='ajax-file-form' style='display: none'></form>").appendTo("body");
                        var file = $(this).appendTo(form);
                        var code = $wrap.find('input.code').val();
                        //token 添加
                        $('<input type="hidden" name="token"/>').val($.cookie("LOGINUSERINFO_TOKEN")).appendTo(form);
                        var file_loading = layer.load(1);
                        var file_mm = layer.msg("文件上传中请稍候...");
                        form.unbind("submit");
                        form.submit(function () {
                            var options = {
                                type: "post",
                                data: {
                                    type: 'admin',
                                    areaid: code
                                },
                                url: ctxPath + "/file/upload",
                                success: function (res) {
                                    if (res.code == "0") {
                                        $wrap.find('input.code').val(res.data[0].url);
                                        $wrap.find('.lightBoxGallery').show();
                                        if (option && option.change) {
                                            option.change(res, $wrap);
                                        }
                                    }
                                    else {
                                        if (res.code == 600) {
                                            window.location.href = ctxPath + "/teacher#/login";
                                        }
                                        else if (option && option.change) {
                                            option.change(null, $wrap);
                                        }
                                    }
                                    file.val("").appendTo($wrap);
                                    layer.close(file_mm)
                                    layer.close(file_loading)
                                },
                                error: function () {
                                    file.val("").appendTo($wrap);
                                    if (option && option.change) {
                                        option.change(null, $wrap);
                                    }
                                    layer.close(file_mm)
                                    layer.close(file_loading)
                                }
                            }
                            $(this).ajaxSubmit(options);
                            return false
                        });
                        form.submit();
                    }
                });
            };
            function bind_button($wrap, opt) {
                $wrap.find('.input-append', $wrap).click(function (e) {
                    e.preventDefault();
                    if (opt.click) {
                        if (!opt.click()) {
                            return false;
                        }
                    }
                    $wrap.find('input[type="file"]').click();
                });
            };

            return plugin.each(function () {
                $this = $(this);
                if ($this) {
                    var multiple = $this.attr('multiple');
                    $wrap = make_form($this, options);
                    bind_change($wrap, multiple, options);
                    bind_button($wrap, options);
                    if(options.init){
                        options.init($wrap);
                    }
                }
            });
        },

        prettyFileExcl: function (options) {
            var defaults = {
                text: "选择文件",
                title: "图片"
            };

            var options = $.extend(defaults, options);


            var plugin = this;

            function make_form($el, opt) {
                $el.wrap('<div></div>');
                $el.hide();
                $el.after('\
						<div class="input-append layui-form-item" style="margin-bottom: 0">\
							<div class="file-action layui-form-item input_group" style="margin-bottom: 0">\
								<input class="layui-input file-btn-input" readonly="readonly" type="text">\
								<span class="group_addon layui-btn layui-btn-primary file-btn-text">' + opt.text + '</span>\
								<span class="group_addon layui-btn file-btn-ku">文件库</span>\
								<input type="hidden" class="code file-btn-code" name="' + $el.attr("data-id") + '">\
								</div>\
						</div>\
					');

                return $el.parent();
            };
            var isIE = /msie/i.test(navigator.userAgent) && !window.opera;

            ;

            function bind_change($wrap, multiple, option) {

                $wrap.find('input[type="file"]').change(function () {
                    // When original file input changes, get its value, show it in the fake input
                    var fileSize = 0;
                    var files = $(this)[0].files,
                        info = '';
                    fileSize = files[0].size;
                    if (files.length == 0)
                        return false;

                    if (!multiple || files.length == 1) {
                        var path = $(this).val().split('\\');
                        info = path[path.length - 1];
                    } else if (files.length > 1) {
                        // Display number of selected files instead of filenames
                        info = "已选择了" + files.length + ' 个文件';
                    }

                    $wrap.find('.input-append input.layui-input').val(info);

                    //判断是否ajax上传文件
                    if ($(this).attr("data-ajax")) {
                        $('.ajax-file-form').remove();
                        var form = $("<form class='ajax-file-form' style='display: none'></form>").appendTo("body");
                        var file = $(this).appendTo(form);
                        var codeInput = $wrap.find('input.code');
                        var code = codeInput.val();
                        var name = codeInput.attr("name");
                        //token 添加
                        $('<input type="hidden" name="token"/>').val($.cookie("LOGINUSERINFO_TOKEN")).appendTo(form);
                        var file_loading = layer.load(1);
                        var file_mm = layer.msg("文件上传中请稍候...");
                        form.unbind("submit");
                        var param = {
                            type: 'admin'
                        }
                        param[name] = code;
                        form.submit(function () {
                            var options = {
                                type: "post",
                                data: param,
                                url: ctxPath + "/file/upload/uploadExcel",
                                success: function (res) {
                                    if (res.code == "0") {
                                        $wrap.find('input.code').val(res.data[0].url);
                                        $wrap.find('.lightBoxGallery').show();
                                        if (option && option.change) {
                                            option.change(res, $wrap);
                                        }
                                    }
                                    else {
                                        if (res.code == 600) {
                                            window.location.href = ctxPath + "/teacher#/login";
                                        }
                                        else if (option && option.change) {
                                            option.change(null, $wrap);
                                        }
                                    }
                                    file.val("").appendTo($wrap);
                                    codeInput.val("").appendTo($wrap);
                                    layer.close(file_mm)
                                    layer.close(file_loading)
                                },
                                error: function () {
                                    file.val("").appendTo($wrap);
                                    codeInput.val("").appendTo($wrap);
                                    if (option && option.change) {
                                        option.change(null, $wrap);
                                    }
                                    layer.close(file_loading)
                                }
                            }
                            $(this).ajaxSubmit(options);
                            return false
                        });
                        form.submit();
                    }
                });
            };
            function bind_button($wrap, opt) {
                $wrap.find('.input-append', $wrap).click(function (e) {
                    e.preventDefault();
                    if (opt.click) {
                        if (!opt.click()) {
                            return false;
                        }
                    }
                    $wrap.find('input[type="file"]').click();
                });
            };

            return plugin.each(function () {
                $this = $(this);
                if ($this) {
                    var multiple = $this.attr('multiple');
                    $wrap = make_form($this, options);
                    bind_change($wrap, multiple, options);
                    bind_button($wrap, options);
                    if(options.init){
                        options.init($wrap);
                    }
                }
            });
        },

        prettyFileDoc: function (options) {
            var defaults = {
                text: "选择文件",
                title: "word"
            };
            var options = $.extend(defaults, options);
            var plugin = this;
            function make_form($el, opt) {
                $el.wrap('<div></div>');
                $el.hide();
                $el.after('\
						<div class="input-append input-group">\
							<div class="file-action input_group">\
								<input class="layui-input file-btn-input" readonly="readonly" type="text">\
								<span class="group_addon layui-btn-normal layui-btn-primary file-btn-text">' + opt.text + '</span>\
								<span class="group_addon layui-btn-danger file-btn-ku">文件库</span>\
								<input type="hidden" class="code file-btn-code" name="' + $el.attr("data-id") + '">\
								</div>\
						</div>\
					');

                return $el.parent();
            };
            var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
            // var all_papers = [];
            function bind_change($wrap, multiple, option) {
                $wrap.find('input[type="file"]').change(function () {
                    // When original file input changes, get its value, show it in the fake input
                    var files = $(this)[0].files,
                        info = '';
                    if (files.length == 0)
                        return false;
                    if (!multiple || files.length == 1) {
                        var path = $(this).val().split('\\');
                        info = path[path.length - 1];
                        var d = info.substring(info.lastIndexOf("."));
                        if (d !== ".doc") {
                            layer.alert("请上传doc文件。如果是docx文件，另存为doc文件再上传。");
                            $(this).val('');
                            return false;
                        }

                        // for(var k in all_papers){
                        //     if(all_papers[k]==info){
                        //         layer.alert("上传的文件有相同的，请换一个文件再上传。");
                        //         return false;
                        //     }
                        // }
                        // all_papers.push(info);

                    } else if (files.length > 1) {
                        // Display number of selected files instead of filenames
                        layer.alert('一次只能选择一个文件')
                        return false;
                        // info = "已选择了" + files.length + ' 个文件';
                    }

                    $wrap.find('.input-append input.layui-input').val(info);
                    //判断是否ajax上传文件
                    if ($(this).attr("data-ajax")) {
                        $('.ajax-file-form').remove();
                        var form = $("<form class='ajax-file-form' style='display: none'></form>").appendTo("body");
                        var file = $(this).appendTo(form);
                        var code = $wrap.find('input.code').val();
                        //token 添加
                        $('<input type="hidden" name="token"/>').val($.cookie("LOGINUSERINFO_TOKEN")).appendTo(form);
                        var file_loading = layer.load(1);
                        var file_mm = layer.msg("文件上传中请稍候...");
                        form.unbind("submit");
                        form.submit(function () {
                            var options = {
                                type: "post",
                                data: {
                                    type: 'admin',
                                    areaid: code
                                },
                                url: ctxPath + "/file/upload/uploadDoc",
                                success: function (res) {
                                    if (res.code == "0") {
                                        // $wrap.find('input.code').val(res.data[0].url);
                                        // $wrap.find('.lightBoxGallery').show();
                                        if (option && option.change) {
                                            option.change(res, $wrap);
                                        }
                                    }
                                    else {
                                        if (res.code == 600) {
                                            window.location.href = ctxPath + "/teacher#/login";
                                        }
                                        else if (option && option.change) {
                                            option.change(null, $wrap);
                                        }
                                    }
                                    file.val("").appendTo($wrap);
                                    layer.close(file_mm)
                                    layer.close(file_loading)
                                },
                                error: function () {
                                    file.val("").appendTo($wrap);
                                    if (option && option.change) {
                                        option.change(null, $wrap);
                                    }
                                    layer.close(file_mm)
                                    layer.close(file_loading)
                                }
                            }
                            $(this).ajaxSubmit(options);
                            return false
                        });
                        form.submit();
                    }
                });
            };
            function bind_button($wrap, opt) {
                $wrap.find('.input-append', $wrap).click(function (e) {
                    e.preventDefault();
                    if (opt.click) {
                        if (!opt.click()) {
                            return false;
                        }
                    }
                    $wrap.find('input[type="file"]').click();
                });
            };

            return plugin.each(function () {
                $this = $(this);
                if ($this) {
                    var multiple = $this.attr('multiple');
                    $wrap = make_form($this, options);

                    bind_change($wrap, multiple, options);
                    bind_button($wrap, options);
                    if(options.init){
                        options.init($wrap);
                    }
                }
            });
        }

    });
}(jQuery));

