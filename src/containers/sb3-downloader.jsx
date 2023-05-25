import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import downloadBlob from '../lib/download-blob';
import log from '../lib/log';
import {showAlertWithTimeout} from '../reducers/alerts';
import {setFileSystemHandle} from '../reducers/project-state';
import {setProjectUnchanged} from '../reducers/project-changed';
/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Downloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Downloader>
 */
class SB3Downloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadSkProject',
            'downloadSb3Project',
            'saveToLastFile',
            'getExtensionData'
        ]);
    }
    getExtensionData (extensions) {
        const result = [];
        for (const id in extensions) {
            if (this.props.extension[id].api > 0) {
                result.push({
                    fileName: `extensions/${id}@${this.props.extension[id].version}.skx`,
                    fileContent: this.props.extension[id].fileContent
                });
            }
        }
        return result;
    }
    async downloadSkProject () {
        const content = await this.props.saveProjectSk(this.props.settings, this.getExtensionData);
        if (this.props.onSaveFinished) {
            this.props.onSaveFinished();
        }
        if (window.showSaveFilePicker) {
            await this.saveFilePicker(`${this.props.projectFilename}.sk`, content);
        } else {
            downloadBlob(`${this.props.projectFilename}.sk`, content);
        }
    }
    async downloadSb3Project () {
        const content = await this.props.saveProjectSb3();
        if (this.props.onSaveFinished) {
            this.props.onSaveFinished();
        }
        if (window.showSaveFilePicker) {
            await this.saveFilePicker(`${this.props.projectFilename}.sb3`, content);
        } else {
            downloadBlob(`${this.props.projectFilename}.sb3`, content);
        }
    }
    async saveToLastFile () {
        const handle = this.props.fileHandle;
        if (handle === null) return;
        const writable = await handle.createWritable();
        this.props.onShowSavingAlert();
        const content = await this.props.saveProjectSb3();
        await writable.write(content);
        await writable.close();
        this.props.onShowSaveSuccessAlert();
        this.props.onSetProjectUnchanged();
    }
    async saveFilePicker (fileName, content) {
        try {
            const fileHandle = await window.showSaveFilePicker(
                {
                    types: [
                        {
                            description: 'Scratch 3 File',
                            accept: {'application/x.sidekick.sb3': ['.sb3']}
                        },
                        {
                            description: 'Sidekick File',
                            accept: {'application/x.sidekick.sk': ['.sk']}
                        }
                    ],
                    suggestedName: fileName,
                    excludeAcceptAllOption: true
                });
            this.props.onShowSavingAlert();
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            this.props.onSetFileSystemHandle(fileHandle);
            await writable.close();
            this.props.onSetProjectUnchanged();
            this.props.onShowSaveSuccessAlert();
        } catch (err) {
            log.error(err);
            if (err.name === 'SecurityError') {
                downloadBlob(fileName, content);
            }
        }
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            {
                sk: this.downloadSkProject,
                sb3: this.downloadSb3Project
            },
            this.saveToLastFile
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}`;
};

SB3Downloader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    fileHandle: PropTypes.func,
    onSaveFinished: PropTypes.func,
    onSetFileSystemHandle: PropTypes.func,
    onSetProjectUnchanged: PropTypes.func,
    onShowSavingAlert: PropTypes.func,
    onShowSaveSuccessAlert: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSk: PropTypes.func,
    saveProjectSb3: PropTypes.func,
    extension: PropTypes.shape({
        extensionId: PropTypes.string,
        iconURL: PropTypes.string,
        insetIconURL: PropTypes.string,
        author: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        name: PropTypes.string,
        description: PropTypes.string,
        requirement: PropTypes.arrayOf(PropTypes.string),
        data: PropTypes.instanceOf(ArrayBuffer)
    }),
    settings: PropTypes.object.isRequired
};
SB3Downloader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSk: state.sidekickGui.vm.saveProjectSk.bind(state.sidekickGui.vm),
    fileHandle: state.sidekickGui.projectState.fileHandle,
    saveProjectSb3: state.sidekickGui.vm.saveProjectSb3.bind(state.sidekickGui.vm),
    projectFilename: getProjectFilename(state.sidekickGui.projectTitle, projectTitleInitialState),
    extension: state.sidekickGui.extension.extension,
    settings: state.sidekickGui.settings
});

const mapDispatchToProps = dispatch => ({
    onSetProjectUnchanged: () => dispatch(setProjectUnchanged()),
    onSetFileSystemHandle: fileHandle => dispatch(setFileSystemHandle(fileHandle)),
    onShowSaveSuccessAlert: () => showAlertWithTimeout(dispatch, 'saveSuccess'),
    onShowSavingAlert: () => showAlertWithTimeout(dispatch, 'saving')
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SB3Downloader);
