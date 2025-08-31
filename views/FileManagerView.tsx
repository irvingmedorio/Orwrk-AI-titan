import React, { useState, useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useTranslation } from '../lib/i18n';
import { FileSystemItem, FileType } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { FolderIcon, FileTextIcon, TableIcon, PresentationIcon, CodeIcon, TrashIcon } from '../components/icons';
import { Input } from '../components/ui/Input';

const FileIcon: React.FC<{ type: FileType }> = ({ type }) => {
    switch (type) {
        case FileType.FOLDER: return <FolderIcon />;
        case FileType.DOCUMENT: return <FileTextIcon />;
        case FileType.SPREADSHEET: return <TableIcon />;
        case FileType.PRESENTATION: return <PresentationIcon />;
        case FileType.CODE: return <CodeIcon />;
        default: return <FileTextIcon />;
    }
};

const TextEditor: React.FC<{ file: FileSystemItem; onSave: (content: string) => void }> = ({ file, onSave }) => {
    const [content, setContent] = useState(file.content || '');
    return (
        <div className="h-full flex flex-col">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-2 bg-dark-background border border-dark-input rounded-md font-mono text-sm"
            />
            <Button onClick={() => onSave(content)} className="mt-4 self-end">Save Content</Button>
        </div>
    );
};

const SpreadsheetEditor: React.FC<{ file: FileSystemItem; onSave: (content: string[][]) => void }> = ({ file, onSave }) => {
    const [grid, setGrid] = useState<string[][]>(file.content || [['', ''], ['', '']]);

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        const newGrid = grid.map(row => [...row]);
        newGrid[rowIndex][colIndex] = value;
        setGrid(newGrid);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <tbody>
                        {grid.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="border border-dark-border p-0">
                                        <Input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            className="w-full h-full bg-dark-background border-none rounded-none focus-visible:ring-1 focus-visible:ring-dark-primary-foreground"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button onClick={() => onSave(grid)} className="mt-4 self-end">Save Spreadsheet</Button>
        </div>
    );
};

const PresentationEditor: React.FC<{ file: FileSystemItem; onSave: (content: any[]) => void }> = ({ file, onSave }) => {
    const [slides, setSlides] = useState(file.content || [{ title: 'Slide 1', points: [] }]);
    const [activeSlide, setActiveSlide] = useState(0);

    const updateSlide = (index: number, newContent: any) => {
        const newSlides = [...slides];
        newSlides[index] = newContent;
        setSlides(newSlides);
    };

    const currentSlide = slides[activeSlide];
    
    return (
         <div className="h-full flex flex-col">
            <div className="flex-1 flex gap-4 min-h-0">
                <div className="w-1/4 overflow-y-auto space-y-2 pr-2">
                    {slides.map((slide, index) => (
                        <div key={index} onClick={() => setActiveSlide(index)} className={`p-2 border rounded-md cursor-pointer ${activeSlide === index ? 'border-dark-primary-foreground' : 'border-dark-border'}`}>
                            <p className="font-semibold truncate">{slide.title}</p>
                        </div>
                    ))}
                </div>
                <div className="w-3/4 flex flex-col gap-4">
                    <Input value={currentSlide.title} onChange={(e) => updateSlide(activeSlide, {...currentSlide, title: e.target.value })} placeholder="Slide Title"/>
                    <textarea value={(currentSlide.points || []).join('\n')} onChange={(e) => updateSlide(activeSlide, {...currentSlide, points: e.target.value.split('\n') })} className="flex-1 w-full p-2 bg-dark-background border border-dark-input rounded-md" placeholder="Slide content..."/>
                </div>
            </div>
            <Button onClick={() => onSave(slides)} className="mt-4 self-end">Save Presentation</Button>
        </div>
    );
};


const FileManagerView: React.FC = () => {
    const { fileSystem, addFileSystemItem, updateFileSystemItem, deleteFileSystemItem } = useAgentStore();
    const { t } = useTranslation();

    const [currentFolderId, setCurrentFolderId] = useState<string | null>('root');
    const [editingFile, setEditingFile] = useState<FileSystemItem | null>(null);

    const breadcrumbs = useMemo(() => {
        const path = [];
        let currentId = currentFolderId;
        while (currentId) {
            const folder = fileSystem.find(item => item.id === currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parentId;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, fileSystem]);

    const currentFolderItems = useMemo(() => {
        return fileSystem.filter(item => item.parentId === currentFolderId);
    }, [currentFolderId, fileSystem]);
    
    const handleCreate = (type: FileType) => {
        const name = window.prompt(`Enter name for new ${t(type.toLowerCase() as any)}:`);
        if (name) {
            let content;
            switch(type) {
                case FileType.SPREADSHEET: content = [['', ''], ['', '']]; break;
                case FileType.PRESENTATION: content = [{title: 'New Slide', points: []}]; break;
                default: content = '';
            }
            addFileSystemItem({ name, type, parentId: currentFolderId, content });
        }
    };

    const handleRename = (item: FileSystemItem) => {
        const newName = window.prompt(`Rename "${item.name}":`, item.name);
        if (newName && newName !== item.name) {
            updateFileSystemItem(item.id, { name: newName });
        }
    };
    
    const handleSave = (fileId: string, content: any) => {
        updateFileSystemItem(fileId, { content });
        setEditingFile(null);
    };

    if (editingFile) {
        let editor;
        switch(editingFile.type) {
            case FileType.DOCUMENT:
            case FileType.CODE:
                editor = <TextEditor file={editingFile} onSave={(c) => handleSave(editingFile.id, c)} />;
                break;
            case FileType.SPREADSHEET:
                 editor = <SpreadsheetEditor file={editingFile} onSave={(c) => handleSave(editingFile.id, c)} />;
                 break;
            case FileType.PRESENTATION:
                 editor = <PresentationEditor file={editingFile} onSave={(c) => handleSave(editingFile.id, c)} />;
                 break;
        }

        return (
             <div className="space-y-6 h-full flex flex-col">
                <Button onClick={() => setEditingFile(null)} variant="outline" className="self-start">
                    &larr; {t('backToFileManager')}
                </Button>
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>{t('editing')} "{editingFile.name}"</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                        {editor}
                    </CardContent>
                </Card>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('fileManager')}</h2>
                    <p className="text-dark-muted-foreground">{t('fileManagerDesc')}</p>
                </div>
                <div className="relative group">
                     <Button>{t('createNew')}</Button>
                     <div className="absolute top-full right-0 mt-2 w-48 bg-dark-secondary border border-dark-border rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        {Object.values(FileType).map(type => (
                             <button key={type} onClick={() => handleCreate(type)} className="w-full text-left px-4 py-2 text-sm hover:bg-dark-accent flex items-center gap-2">
                                <FileIcon type={type} /> {t(type.toLowerCase() as any)}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-muted-foreground mb-4">
                {breadcrumbs.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                        <button onClick={() => setCurrentFolderId(folder.id)} className="hover:text-dark-foreground">{folder.name}</button>
                        {index < breadcrumbs.length - 1 && <span>/</span>}
                    </React.Fragment>
                ))}
            </div>

            <Card>
                <CardContent className="pt-6">
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs text-dark-muted-foreground uppercase bg-dark-secondary">
                            <tr>
                                <th className="p-4 w-2/3">{t('name')}</th>
                                <th className="p-4 w-1/6">{t('lastModified')}</th>
                                <th className="p-4 w-1/6">{t('type')}</th>
                                <th className="p-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                         <tbody>
                            {currentFolderItems.map(item => (
                                <tr key={item.id} className="border-b border-dark-border hover:bg-dark-accent">
                                    <td className="p-4 font-medium">
                                        <button 
                                            onClick={() => item.type === FileType.FOLDER ? setCurrentFolderId(item.id) : setEditingFile(item)}
                                            className="flex items-center gap-2 w-full text-left"
                                        >
                                            <FileIcon type={item.type} />
                                            {item.name}
                                        </button>
                                    </td>
                                    <td className="p-4 text-dark-muted-foreground">{new Date(item.lastModified).toLocaleString()}</td>
                                    <td className="p-4 text-dark-muted-foreground">{t(item.type.toLowerCase() as any)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleRename(item)}>{t('rename')}</Button>
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-400/10" onClick={() => deleteFileSystemItem(item.id)}>
                                                <TrashIcon />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                     {currentFolderItems.length === 0 && (
                         <div className="text-center p-8 text-dark-muted-foreground">{t('folderIsEmpty')}</div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FileManagerView;
