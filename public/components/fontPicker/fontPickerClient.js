const fontList = {
    "System Fonts": [
        { "name": 'Arial' },
        { "name": 'Helvetica' },
        { "name": 'Times New Roman' },
        { "name": 'Times' },
        { "name": 'Courier New' },
        { "name": 'Courier' },
        { "name": 'Verdana' },
        { "name": 'Georgia' },
        { "name": 'Palatino' },
        { "name": 'Garamond' },
        { "name": 'Bookman' },
        { "name": 'Tahoma' },
        { "name": 'Trebuchet MS' },
        { "name": 'Arial Black' },
        { "name": 'Impact' },
        { "name": 'Comic Sans MS' }
    ],
    "Windows Fonts": [
        { "name": 'Microsoft Sans Serif' },
        { "name": 'Segoe UI' },
        { "name": 'Calibri' },
        { "name": 'Cambria' },
        { "name": 'Candara' },
        { "name": 'Consolas' },
        { "name": 'Constantia' },
        { "name": 'Corbel' },
        { "name": 'Franklin Gothic Medium' }
    ],
    "Mac OS Fonts": [
        { "name": 'Apple SD Gothic Neo' },
        { "name": 'AppleGothic' },
        { "name": 'Geneva' },
        { "name": 'Helvetica Neue' },
        { "name": 'Lucida Grande' },
        { "name": 'Monaco' },
        { "name": 'Optima' },
        { "name": 'San Francisco' }
    ]
};


export function loadFonts() {
    let $select = $('#fontSelector');
    $.each(fontList, function (key, value) {
        let group = $('<optgroup style="font-family: Arial" label="' + key + '" />');
        $.each(value, function () {
            $('<option />').html(this.name).appendTo(group).css('font-family', this.name);
        });
        group.appendTo($select);
    });
}
