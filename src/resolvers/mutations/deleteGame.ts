import jwt from 'jsonwebtoken';
import { ResolverContext } from '../../pages/api/graphql';
import User from '../../types/user';
import { verifyJwt } from '../../utils/jwt';

const DELETE_GAME_IF_CREATOR = `
    WITH game AS (
        SELECT (COUNT(1) = 0) AS can_edit
        FROM games WHERE id = $1 AND creator != $2
    ), delete_questions AS (
        DELETE FROM questions
        WHERE game_id = $1 AND (SELECT game.can_edit FROM game)
    )
    DELETE FROM games
    WHERE id = $1 AND (SELECT game.can_edit FROM game);
`;

type DeleteGameArgs = {
    token: string;
    id: string;
};

const deleteGame = async (_parent: void, { token, id }: DeleteGameArgs, { db }: ResolverContext): Promise<boolean> => {
    if (!(await verifyJwt(token))) return false;
    const { email } = jwt.decode(token) as User;

    const response = await db.query(DELETE_GAME_IF_CREATOR, [id, email]);

    return response.rowCount === 1;
};

export default deleteGame;
