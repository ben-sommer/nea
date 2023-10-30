export type Player = {
    firstName: string;
    lastName: string;
    username: string;
    invitedBy: { [username: string]: boolean };
    sentInvites: { [username: string]: boolean };
};
