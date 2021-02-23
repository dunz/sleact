import { CreateModal, CloseModalButton } from '@components/Modal/styles';
import React, { FC, PropsWithChildren, useCallback } from 'react';

interface Props {
    show: boolean;
    onCloseModal: () => void;
}

const Modal: FC<PropsWithChildren<Props>> = ({ show, children, onCloseModal }) => {
    if (!show) return null;

    const stopPropagation = useCallback((e) => {
        e.stopPropagation();
    }, []);

    return (
        <CreateModal onClick={onCloseModal}>
            <div onClick={stopPropagation}>
                <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
                {children}
            </div>
        </CreateModal>
    );
};

export default Modal;
