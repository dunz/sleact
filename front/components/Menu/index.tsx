import { CreateMenu, CloseModalButton } from '@components/Menu/styles';
import React, { CSSProperties, FC, PropsWithChildren, useCallback } from 'react';

interface Props {
    show: boolean;
    onCloseModal: (e: any) => void;
    style: CSSProperties;
    closeButton?: boolean;
}

const Menu: FC<PropsWithChildren<Props>> = ({ closeButton, style, show, children, onCloseModal }) => {
    if (!show) {
        return null;
    }

    const stopPropagation = useCallback((e) => {
        e.stopPropagation();
    }, []);

    // return (
    //     <CreateMenu onClick={onCloseModal}>
    //         <div onClick={stopPropagation} style={style}>
    //             {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
    //             {children}
    //         </div>
    //     </CreateMenu>
    // );
    return (
        <CreateMenu onClick={onCloseModal}>
            <div style={style} onClick={stopPropagation}>
                {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
                {children}
            </div>
        </CreateMenu>
    );
};
Menu.defaultProps = {
    closeButton: true,
};

export default Menu;
