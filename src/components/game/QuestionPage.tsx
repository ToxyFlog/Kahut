import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { gql, useMutation } from '@apollo/client';
import { GamePageProps, ShowQuestionData } from '../../pages/lobby/[code]';
import Radio from '../Radio';
import Button from '../Button';
import Checkbox from '../Checkbox';
import QuizButton from '../QuizButton';
import TimerLine from '../TimerLine';
import { color } from '../../styles/theme';
import Timer from '../Timer';
import ScalingText from '../ScalingText';

const SUBMIT_ANSWER = gql`
    mutation submitAnswer($game_token: String!, $question_id: String!, $answers: [Int!]!) {
        submitAnswer(game_token: $game_token, question_id: $question_id, answers: $answers)
    }
`;

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100vw;
    height: 100vh;
    max-height: 150vh;
    overflow-y: scroll;
    position: relative;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 2.5vw;
`;

export const Buttons = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 90vw;

    @media (max-width: 800px) {
        flex-direction: column;

        button {
            margin-left: 0;
            margin-right: 0;
        }
    }
`;

export const QuestionNumber = styled.p`
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 18px;
    font-weight: 300;
    color: ${color('white1')};

    @media (max-width: 800px) {
        top: 5px;
        right: 5px;
        font-size: 14px;
    }
`;

const LoadingTitle = styled(ScalingText)`
    font-weight: 100;
    letter-spacing: -0.3px;
    margin: 8px 0;
    padding: 10px 20px;
    width: 100%;
    text-align: center;
    background: ${color('black0')};
    color: ${color('white1')};
`;

export const Title = styled(ScalingText)`
    font-weight: 200;
    letter-spacing: -0.1px;
    margin-top: 8px;
    padding: 5px 10px;
    background: ${color('black0')};
    color: ${color('white1')};
    border-radius: 5px;
    box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.3);
    text-align: center;
    width: fit-content;
    max-width: 80vw;
`;

export const Image = styled.img`
    max-width: 70vw;
    max-height: 40vh;
    margin: 10px 0 10px -50px;
`;

export const QuestionQuizButton = styled(QuizButton)`
    max-height: 200px;
    overflow-x: scroll;

    & input {
        margin: 0 10px;
    }
`;

type Props = GamePageProps & ShowQuestionData;

const QuestionPage: FunctionComponent<Props> = ({ id, title, image, type, index, choices, time, gameToken }) => {
    const [answers, setAnswers] = useState<number[]>([]);
    const [canAnswer, setCanAnswer] = useState(true);
    const [_submitAnswer] = useMutation(SUBMIT_ANSWER);
    const [showPrompt, setShowPrompt] = useState(true);

    const submitAnswer = async () => {
        if (answers.length === 0) return;

        const { data } = await _submitAnswer({ variables: { game_token: gameToken, question_id: id, answers } });
        if (data.submitAnswer) setCanAnswer(false);
    };

    if (showPrompt)
        return (
            <Container style={{ justifyContent: 'center' }}>
                <LoadingTitle max={32} charsPerPx={8} min={18}>
                    {title}
                </LoadingTitle>
                <TimerLine time={3} height={15} onEnd={() => setShowPrompt(false)} />
            </Container>
        );
    else
        return (
            <Container>
                <Title max={24} charsPerPx={8} min={16}>
                    {title}
                </Title>
                <QuestionNumber>#{index + 1}</QuestionNumber>

                <Row>
                    <Timer time={time} />
                    <Image src={image} />
                    <div />
                </Row>

                <Buttons>
                    {choices.map((text, index) => {
                        const checkboxOnChange = () => {
                            if (!canAnswer) return;
                            setAnswers(answers.includes(index) ? answers.filter(answerIndex => answerIndex !== index) : [...answers, index]);
                        };

                        const radioOnChange = () => {
                            if (!canAnswer) return;
                            setAnswers([index]);
                        };

                        return (
                            <QuestionQuizButton key={index} color={index} disabled={!canAnswer} onClick={type === 'single' ? radioOnChange : checkboxOnChange}>
                                {type === 'single' ? (
                                    <Radio name="radio" checked={answers[0] === index} onChange={radioOnChange} disabled={!canAnswer} />
                                ) : (
                                    <Checkbox checked={answers.includes(index)} onChange={checkboxOnChange} disabled={!canAnswer} />
                                )}
                                <ScalingText max={22} charsPerPx={25} min={10}>
                                    {text}
                                </ScalingText>
                            </QuestionQuizButton>
                        );
                    })}
                </Buttons>

                <Button style={{ marginBottom: '10px' }} onClick={submitAnswer} disable={!canAnswer}>
                    Submit answer
                </Button>
            </Container>
        );
};

export default QuestionPage;
