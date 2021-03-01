import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

type Handler = (e: ChangeEvent<HTMLInputElement>) => void;
type ReturnTypes<T = ChangeEvent<HTMLInputElement>> = [T, Handler, Dispatch<SetStateAction<T>>];
const useInput = <T>(initialValue: T): ReturnTypes<T> => {
    const [value, setValue] = useState(initialValue);
    const handler = useCallback((e) => {
        setValue(e.target.value);
    }, []);
    return [value, handler, setValue];
};

export default useInput;
