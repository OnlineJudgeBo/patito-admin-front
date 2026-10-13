import {
    Autoformat, BlockQuote, Bold, ClassicEditor as BaseClassicEditor, Code, CodeBlock, Essentials, FontBackgroundColor, FontColor,
    Heading, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload, Italic, Link, List, Paragraph,
    PasteFromOffice, Table, TableToolbar
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

// The editor of every statement. Each page still picks its own toolbar.
export default class ClassicEditor extends BaseClassicEditor {
    static builtinPlugins = [
        Autoformat, BlockQuote, Bold, Code, CodeBlock, Essentials, FontBackgroundColor, FontColor,
        Heading, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload, Italic, Link, List, Paragraph,
        PasteFromOffice, Table, TableToolbar
    ];

    static defaultConfig = {
        licenseKey: 'GPL',
        image: {
            resizeUnit: '%',
            resizeOptions: [
                { name: 'resizeImage:original', value: null, label: 'Original' },
                { name: 'resizeImage:25', value: '25', label: '25%' },
                { name: 'resizeImage:50', value: '50', label: '50%' },
                { name: 'resizeImage:75', value: '75', label: '75%' }
            ],
            styles: { options: ['inline', 'alignLeft', 'block', 'alignRight'] },
            // Shown when an image is selected; the corners of the image also resize it.
            toolbar: [
                'imageStyle:inline', 'imageStyle:alignLeft', 'imageStyle:block', 'imageStyle:alignRight', '|',
                'resizeImage', '|',
                'toggleImageCaption', 'imageTextAlternative'
            ]
        },
        table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] }
    };
}
