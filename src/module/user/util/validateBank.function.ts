import { BadRequestException } from "@nestjs/common";
import {
  CardNumber,
  IbanNumber,
  ValidateBankType,
} from "src/common/enum/bankData.enum";

export function ValidateBankAccount(accountNumber: string, iban: string) {
  const validateAccountNumber = iban?.slice(-accountNumber?.length);
  if (validateAccountNumber !== accountNumber) {
    throw new BadRequestException("شماره حساب این شماره شبا اشتباه می باشد");
  }
  return true;
}

export function ValidateIbanOrBankCard(value: string, type: string) {
  if (type === ValidateBankType.Iban) {
    const Iban = value?.substring(4, 7);
    for (const key in IbanNumber) {
      if (IbanNumber[key] === Iban) {
        return { validatedIban: key };
      }
    }

    throw new BadRequestException("اطلاعات شماره شبا وارد شده صحیح نمی باشد");
  } else if (type === ValidateBankType.Card) {
    const Card = value?.substring(0, 6);
    for (const key in CardNumber) {
      if (CardNumber[key] === Card) {
        return { validatedCard: key };
      }
    }

    throw new BadRequestException("اطلاعات شماره کارت وارد شده صحیح نمی باشد");
  } else throw new BadRequestException("اطلاعات را به درستی وارد کنید");
}
