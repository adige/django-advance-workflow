'use strict';

/**
 * Created by ahmetdal on 04/09/14.
 */

/*jshint indent: false */
/*jshint undef: false */


describe('DawClient', function () {
    var expectedType = DawClient.APPROVE;
    var expectedContentTypeId = 1;
    var expectedObjectId = 1;
    var expectedField = 1;
    var expectedCurrentStateId = 1;
    var expectedNextStateId = 2;
    var expectedCallbackUri = 'testCallbackUri';
    var expectedState = {id: 1, label: 's2'};
    var redirected = false;
    beforeEach(function () {


        spyOn($, 'ajax').andCallFake(function (options) {
            if (options.url === DawClient.GET_STATE_BY_LABEL_URI || options.url === DawClient.GETTING_CURRENT_STATE_URI) {
                options.success(expectedState);
            } else if (options.url === DawClient.APPROVE_TRANSITION_URI || options.url === DawClient.REJECT_TRANSITION_URI) {
                options.success();
            }
        });
        spyOn(DawClient, 'redirectUri').andCallFake(function () {
            redirected = true;
        });

    });


    it('Get Current State', function () {
        var currentState = DawClient.getCurrentState(expectedContentTypeId, expectedObjectId, expectedField);
        expect(JSON.stringify(currentState)).toBe(JSON.stringify(expectedState));
    });

    it('Get State By Label', function () {
        var state = DawClient.getStateByLabel('s2');
        expect(JSON.stringify(state)).toBe(JSON.stringify(expectedState));
    });

    it('Register Transition Process', function () {
        expect(DawClient.WAITING_TRANSITION_PROCESSES).toBeDefined();
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);


        DawClient.registerTransitionProcess(expectedType, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId, expectedCallbackUri);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(1);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].type).toBe(expectedType);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].contentTypeId).toBe(expectedContentTypeId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].objectId).toBe(expectedObjectId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].field).toBe(expectedField);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].currentStateId).toBe(expectedCurrentStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].nextStateId).toBe(expectedNextStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].callbackUri).toBe(expectedCallbackUri);
        expect(DawClient.WAITING_TRANSITION_PROCESSES[0].date).not.toBeGreaterThan(new Date());

    });
    it('Get Transition Process', function () {
        expect(DawClient.WAITING_TRANSITION_PROCESSES).toBeDefined();
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(1);
        var transitionProcesses = DawClient.getTransitionProcesses(expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(transitionProcesses[0].type).toBe(expectedType);
        expect(transitionProcesses[0].contentTypeId).toBe(expectedContentTypeId);
        expect(transitionProcesses[0].objectId).toBe(expectedObjectId);
        expect(transitionProcesses[0].field).toBe(expectedField);
        expect(transitionProcesses[0].currentStateId).toBe(expectedCurrentStateId);
        expect(transitionProcesses[0].nextStateId).toBe(expectedNextStateId);
        expect(transitionProcesses[0].date).not.toBeGreaterThan(new Date());

    });
    it('Unregister Transition Process', function () {
        expect(DawClient.WAITING_TRANSITION_PROCESSES).toBeDefined();
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(1);
        DawClient.unRegisterTransitionProcess(expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
    });

    it('Commit Transition Process', function () {
        redirected = false;
        expect(DawClient.WAITING_TRANSITION_PROCESSES).toBeDefined();
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        DawClient.registerTransitionProcess(expectedType, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId, expectedCallbackUri);
        var transitionProcesses = DawClient.getTransitionProcesses(expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(transitionProcesses.length).toBe(1);
        DawClient.commitTransitionProcess(expectedContentTypeId, expectedObjectId, expectedField, expectedCurrentStateId, expectedNextStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        expect(redirected).toBeTruthy();
    });

    it('Commit Last Transition Process', function () {
        redirected = false;
        expect(DawClient.WAITING_TRANSITION_PROCESSES).toBeDefined();
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        DawClient.registerTransitionProcess(expectedType, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId, expectedCallbackUri);
        var transitionProcesses = DawClient.getTransitionProcesses(expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(transitionProcesses.length).toBe(1);
        DawClient.commitLastTransitionProcess(expectedContentTypeId, expectedObjectId, expectedField);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        expect(redirected).toBeTruthy();
    });

    it('Register Process Callback', function () {
        expect(DawClient.PROCESS_CALLBACK_EVENTS).toBeDefined();
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(0);


        DawClient.registerProcessCallBack(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId, function () {
        });
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(1);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].type).toBe(DawClient.BEFORE_PROCESS);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].sourceStateId).toBe(expectedCurrentStateId);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].destinationStateId).toBe(expectedNextStateId);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].contentTypeId).toBeUndefined();
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].objectId).toBeUndefined();
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].field).toBeUndefined();
    });

    it('Get Process Callback', function () {
        expect(DawClient.PROCESS_CALLBACK_EVENTS).toBeDefined();
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(1);
        var processCallbacks = DawClient.getProcessCallBacks(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId);
        expect(processCallbacks[0].type).toBe(DawClient.BEFORE_PROCESS);
        expect(processCallbacks[0].sourceStateId).toBe(expectedCurrentStateId);
        expect(processCallbacks[0].destinationStateId).toBe(expectedNextStateId);
        expect(processCallbacks[0].contentTypeId).toBeUndefined();
        expect(processCallbacks[0].objectId).toBeUndefined();
        expect(processCallbacks[0].field).toBeUndefined();

    });
    it('Unregister Process Callback', function () {
        expect(DawClient.PROCESS_CALLBACK_EVENTS).toBeDefined();
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(1);
        DawClient.unRegisterProcessCallBack(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId);
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(0);
    });


    it('Get Parametrized Uri', function () {
        var uri = '$0$1$2$3';
        var args = [0, 'a', 2];
        var expectedUri = '0a2$3';
        expect(DawClient.getParameterizedUri(uri, args)).toBe(expectedUri);
        args.push('last');
        expectedUri = '0a2last';
        expect(DawClient.getParameterizedUri(uri, args)).toBe(expectedUri);
    });

    it('Invoke Process Callback For Before Process', function () {
        redirected = false;
        var beforeProcessVariable;
        var d = {};
        var expectedCallbackResult = 1;
        var expectedBeforeProcessVariable = 1;

        DawClient.registerProcessCallBack(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId, function (data) {
            d = data;
            beforeProcessVariable = expectedBeforeProcessVariable;
            return expectedCallbackResult;
        });

        expect(beforeProcessVariable).toBeUndefined();
        expect(JSON.stringify(d)).toBe('{}');
        var result = DawClient.invokeProcessCallback(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId);
        expect(result.length).toBe(2);
        expect(result[0]).toBeTruthy();
        expect(result[1].length).toBe(1);
        expect(result[1][0]).toBe(expectedCallbackResult);
        expect(beforeProcessVariable).toBe(expectedBeforeProcessVariable);
        expect(JSON.stringify(d)).toBe(
            JSON.stringify({
                               type: DawClient.BEFORE_PROCESS,
                               currentStateId: expectedCurrentStateId,
                               nextStateId: expectedNextStateId,
                               contentTypeId: undefined,
                               objectId: undefined,
                               field: undefined,
                               callback: undefined
                           }));

        expect(redirected).toBeFalsy();

    });

    it('Invoke Process Callback For After Process', function () {
        redirected = false;

        var afterProcessVariable;
        var d = {};
        var expectedCallbackResult = 1;
        var expectedAfterProcessVariable = 1;


        DawClient.registerProcessCallBack(DawClient.AFTER_PROCESS, expectedCurrentStateId, expectedNextStateId, function (data) {
            d = data;
            afterProcessVariable = expectedAfterProcessVariable;
            return expectedCallbackResult;
        });

        expect(afterProcessVariable).toBeUndefined();
        expect(JSON.stringify(d)).toBe('{}');
        var result = DawClient.invokeProcessCallback(DawClient.AFTER_PROCESS, expectedCurrentStateId, expectedNextStateId);
        expect(result.length).toBe(2);
        expect(result[0]).toBeTruthy();
        expect(result[1].length).toBe(1);
        expect(result[1][0]).toBe(expectedCallbackResult);
        expect(afterProcessVariable).toBe(expectedAfterProcessVariable);
        expect(JSON.stringify(d)).toBe(
            JSON.stringify({
                               type: DawClient.AFTER_PROCESS,
                               currentStateId: expectedCurrentStateId,
                               nextStateId: expectedNextStateId,
                               contentTypeId: undefined,
                               objectId: undefined,
                               field: undefined,
                               callback: undefined
                           }));

        expect(redirected).toBeFalsy();
    });
    it('Process Transition Without Invoke Callback Function', function () {
        redirected = false;

        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(2);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].type).toBe(DawClient.BEFORE_PROCESS);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[1].type).toBe(DawClient.AFTER_PROCESS);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);

        DawClient.processTransition(DawClient.APPROVE, expectedCallbackUri, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(1);

        expect(redirected).toBeFalsy();

    });
    it('Process Transition With Invoke Before Callback Function', function () {
        redirected = false;

        DawClient.registerProcessCallBack(DawClient.BEFORE_PROCESS, expectedCurrentStateId, expectedNextStateId, function (data) {
            data.callback();
        });
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(2);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].type).toBe(DawClient.BEFORE_PROCESS);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[1].type).toBe(DawClient.AFTER_PROCESS);

        DawClient.processTransition(DawClient.APPROVE, expectedCallbackUri, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);

        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        expect(redirected).toBeFalsy();
    });

    it('Process Transition With Invoke After Callback Function', function () {
        redirected = false;

        DawClient.registerProcessCallBack(DawClient.AFTER_PROCESS, expectedCurrentStateId, expectedNextStateId, function (data) {
            data.callback();
        });
        expect(DawClient.PROCESS_CALLBACK_EVENTS.length).toBe(2);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[0].type).toBe(DawClient.BEFORE_PROCESS);
        expect(DawClient.PROCESS_CALLBACK_EVENTS[1].type).toBe(DawClient.AFTER_PROCESS);

        DawClient.processTransition(DawClient.APPROVE, expectedCallbackUri, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);

        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        expect(redirected).toBeTruthy();
    });

    it('Process Transition With No Before and After Callback Function', function () {
        redirected = false;
        DawClient.PROCESS_CALLBACK_EVENTS = [];
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        DawClient.processTransition(DawClient.APPROVE, expectedCallbackUri, expectedContentTypeId, expectedObjectId, expectedField, expectedNextStateId);
        expect(DawClient.WAITING_TRANSITION_PROCESSES.length).toBe(0);
        expect(redirected).toBeTruthy();
    });
});
