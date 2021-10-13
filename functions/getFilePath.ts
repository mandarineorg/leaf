export const MANDARINE_GET_FILE_PATH = (path: string | URL): string => {
    let filePath = undefined;

    if(path instanceof URL) {
        filePath = path.toString();
    } else {
        filePath = path;
    }
    return filePath;
}

export const getFilePathString = ["getFilePath", MANDARINE_GET_FILE_PATH.toString()];