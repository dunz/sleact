import ChannelList from '@components/ChannelList';
import CreateChannelModal from '@components/CreateChannelModal';
import DMList from '@components/DMList';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import Menu from '@components/Menu';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel, IUser, IWorkspace } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import gravatar from 'gravatar';
import React, { FC, useCallback, useEffect, useState, VFC } from 'react';
import { useParams } from 'react-router';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';

import {
    AddButton,
    Channels,
    Chats,
    Header,
    LogOutButton,
    MenuScroll,
    ProfileImg,
    ProfileModal,
    RightMenu,
    WorkspaceButton,
    WorkspaceModal,
    WorkspaceName,
    Workspaces,
    WorkspaceWrapper,
} from './styles';
import loadable from '@loadable/component';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
    const params = useParams<{ workspace?: string }>();
    // // console.log('params', params, 'location', location, 'routeMatch', routeMatch, 'history', history);
    const { workspace } = params;
    const [socket, disconnectSocket] = useSocket(workspace);
    const { data: userData, error: loginError, mutate: mutateUser, revalidate: revalidateUser } = useSWR(
        '/api/users',
        fetcher,
    );
    const { data: channelData } = useSWR<IChannel[]>(
        userData ? `/api/workspaces/${workspace}/channels` : null,
        fetcher,
    );
    const { data: memberData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
    const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
    const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
    const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
    const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

    const onLogOut = useCallback(() => {
        axios
            .post('/api/users/logout')
            .then(() => {
                mutateUser(false, false);
            })
            .catch((error) => {
                console.dir(error);
                toast.error(error.response?.data, { position: 'bottom-center' });
            });
    }, []);

    const onCreateWorkspace = useCallback(
        (e) => {
            e.preventDefault();
            if (!newWorkspace || !newWorkspace.trim()) {
                return;
            }
            if (!newUrl || !newUrl.trim()) {
                return;
            }
            axios
                .post('/api/workspaces', {
                    workspace: newWorkspace,
                    url: newUrl,
                })
                .then(() => {
                    revalidateUser();
                    setShowCreateWorkspaceModal(false);
                    setNewWorkspace('');
                    setNewUrl('');
                })
                .catch((error) => {
                    console.dir(error);
                    toast.error(error.response?.data, { position: 'bottom-center' });
                });
        },
        [newWorkspace, newUrl],
    );

    const onClickCreateWorkspace = useCallback(() => {
        setShowCreateWorkspaceModal(true);
    }, []);

    const onClickAddChannel = useCallback(() => {
        setShowCreateChannelModal(true);
    }, []);

    const onClickInviteWorkspace = useCallback(() => {
        setShowInviteWorkspaceModal(true);
    }, []);

    const onCloseModal = useCallback(() => {
        setShowCreateWorkspaceModal(false);
        setShowCreateChannelModal(false);
        setShowInviteWorkspaceModal(false);
        setShowInviteChannelModal(false);
    }, []);
    //
    const onClickUserProfile = useCallback((e) => {
        e.stopPropagation();
        setShowUserMenu((prev) => {
            console.log('prev');
            return !prev;
        });
    }, []);

    const toggleWorkspaceModal = useCallback(() => {
        setShowWorkspaceModal((prev) => !prev);
    }, []);

    useEffect(() => {
        return () => {
            console.info('disconnect socket', workspace);
            disconnectSocket();
        };
    }, [disconnectSocket, workspace]);
    useEffect(() => {
        if (channelData && userData) {
            socket?.emit('login', { id: userData?.id, channels: channelData.map((v) => v.id) });
        }
    }, [socket, userData, channelData]);

    if (!userData) {
        return <Redirect to="/login" />;
    }

    return (
        <div>
            <Header>
                <RightMenu>
                    <span onClick={onClickUserProfile}>
                        <ProfileImg
                            src={gravatar.url(userData.email, { s: '28px', d: 'retro' })}
                            alt={userData.nickname}
                        />
                        <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                            <ProfileModal>
                                <img
                                    src={gravatar.url(userData.nickname, { s: '28px', d: 'retro' })}
                                    alt={userData.nickname}
                                />
                                <div>
                                    <span id="profile-name">{userData.nickname}</span>
                                    <span id="profile-active">{userData.Active}</span>
                                </div>
                            </ProfileModal>
                            <LogOutButton onClick={onLogOut}>로그아웃</LogOutButton>
                        </Menu>
                    </span>
                </RightMenu>
            </Header>
            <WorkspaceWrapper>
                <Workspaces>
                    {userData.Workspaces?.map((ws: IWorkspace) => {
                        return (
                            <Link key={ws.id} to={`/workspace/${ws.id}/channel/일반`}>
                                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                            </Link>
                        );
                    })}
                    <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
                </Workspaces>
                <Channels>
                    <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
                    <MenuScroll>
                        <Menu
                            show={showWorkspaceModal}
                            onCloseModal={toggleWorkspaceModal}
                            style={{ top: 95, left: 80 }}
                        >
                            <WorkspaceModal>
                                <h2>{userData.Workspaces?.find((v: IWorkspace) => v.url === workspace)?.name}</h2>
                                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                                <button onClick={onClickAddChannel}>채널 만들기</button>
                                <button onClick={onLogOut}>로그아웃</button>
                            </WorkspaceModal>
                        </Menu>
                        {channelData?.map((channel: IChannel) => (
                            <div key={channel.id}>{channel.name}</div>
                        ))}
                        <ChannelList />
                        <DMList />
                    </MenuScroll>
                </Channels>
                <Chats>
                    <Switch>
                        <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
                        <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
                    </Switch>
                </Chats>
            </WorkspaceWrapper>
            <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
                <form onSubmit={onCreateWorkspace}>
                    <Label id="workspace-label">
                        <span>워크스페이스 이름</span>
                        <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
                    </Label>
                    <Label id="workspace-url-label">
                        <span>워크스페이스 url</span>
                        <Input id="workspace-url" value={newUrl} onChange={onChangeNewUrl} />
                    </Label>
                    <Button type="submit">생성하기</Button>
                </form>
            </Modal>
            <CreateChannelModal
                show={showCreateChannelModal}
                onCloseModal={onCloseModal}
                setShowCreateChannelModal={setShowCreateChannelModal}
            />
            <InviteWorkspaceModal
                show={showInviteWorkspaceModal}
                onCloseModal={onCloseModal}
                setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
            />
            <InviteChannelModal
                show={showInviteChannelModal}
                onCloseModal={onCloseModal}
                setShowInviteChannelModal={setShowInviteChannelModal}
            />
        </div>
    );
};

export default Workspace;
