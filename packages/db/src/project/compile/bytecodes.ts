import { logger } from "@truffle/db/logger";
const debug = logger("db:project:compile:bytecodes");

import { IdObject, resources } from "@truffle/db/project/process";
import * as Batch from "./batch";

export const generateBytecodesLoad = Batch.Contracts.generate<{
  compilation: {};
  contract: {
    bytecode: DataModel.BytecodeInput;
    deployedBytecode: DataModel.BytecodeInput;
    immutableReferences: { [key: string]: {}[] };
  };
  source: {};
  resources: {
    callBytecode: IdObject<DataModel.Bytecode>;
    createBytecode: IdObject<DataModel.Bytecode>;
  };
  entry: {
    callBytecode: DataModel.BytecodeInput;
    createBytecode: DataModel.BytecodeInput;
    immutableReferences: { [key: string]: {}[] };
  };
  result: {
    callBytecode: IdObject<DataModel.Bytecode>;
    createBytecode: IdObject<DataModel.Bytecode>;
  };
}>({
  extract({
    input: {
      bytecode: createBytecode,
      deployedBytecode: callBytecode,
      immutableReferences
    }
  }) {
    return {
      createBytecode,
      callBytecode,
      immutableReferences
    };
  },

  *process({ entries }) {
    const callBytecodes = yield* resources.load(
      "bytecodes",
      entries.map(({ callBytecode, immutableReferences }) => ({
        ...callBytecode,
        immutableReferences
      }))
    );

    const createBytecodes = yield* resources.load(
      "bytecodes",
      entries.map(({ createBytecode }) => createBytecode)
    );

    return callBytecodes.map((callBytecode, index) => ({
      callBytecode,
      createBytecode: createBytecodes[index]
    }));
  },

  convert<_I, _O>({
    result: { callBytecode, createBytecode },
    input: contract
  }) {
    return {
      ...contract,
      db: {
        ...contract.db,
        callBytecode,
        createBytecode
      }
    };
  }
});
