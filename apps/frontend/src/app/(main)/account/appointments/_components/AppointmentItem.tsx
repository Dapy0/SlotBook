import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AppointmentItem({ serviceName, facilityName, staffName, date, time, price, status }: any) {
  return (
    <div className="flex w-full items-center justify-between p-4">
      <div className="flex flex-col gap-1">
        <p className="m-0 font-medium">Окрашивание в один тон</p>
        <p className="text-sm font-light text-gray-600">
          Studio Nord · Anna K. · 28 авг 2026, 11:00
        </p>
      </div>
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-md font-bold">320,00 zł</span>
          <Badge variant={"destructive"} >
            подтверждено
          </Badge>
          <Button variant={"outline"} className="font-medium text-red-500">
            Отменить
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentItem;
