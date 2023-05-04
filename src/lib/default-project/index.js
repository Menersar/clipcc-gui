import projectData from './project-data';

/* eslint-disable import/no-unresolved,camelcase */
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import sparrow_smile from '!raw-loader!./0fb9be3e8397c983338cb71dc84d0b25.svg';
import sparrow_ww from '!raw-loader!./bcf454acf82e4504149f7ffe07081dbc.svg';
import chatter from '!arraybuffer-loader!./fd8543abeeba255072da239223d2d342.wav';

/* eslint-enable import/no-unresolved,camelcase */

const defaultProject = translator => {
    const encoder = new TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: '0fb9be3e8397c983338cb71dc84d0b25',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(sparrow_smile)
    }, {
        id: 'bcf454acf82e4504149f7ffe07081dbc',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(sparrow_ww)
    }, {
        id: 'fd8543abeeba255072da239223d2d342',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(chatter)
    }];
};

export default defaultProject;
